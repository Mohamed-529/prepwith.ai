const fs = require("fs");
const path = require("path");
const { GoogleGenAI, Type } = require("@google/genai");
const cacheService = require("./cacheService");
const logger = require("../utils/logger");

class AIService {
  constructor() {
    this.knowledgeBase = this.loadKnowledgeBase();
  }

  loadKnowledgeBase() {
    try {
      const kbPath = path.join(__dirname, "../data/knowledgeBase.json");
      if (fs.existsSync(kbPath)) {
        const raw = fs.readFileSync(kbPath, "utf-8");
        const parsed = JSON.parse(raw);
        logger.info(`[AIService] RAG Knowledge Base loaded with ${parsed.topics?.length || 0} topics.`);
        return parsed.topics || [];
      }
    } catch (err) {
      logger.error(`[AIService] Error loading Knowledge Base: ${err.message}`);
    }
    return [];
  }

  // Retrieve relevant RAG context from verified Knowledge Base
  retrieveRAGContext(questionText = "", category = "") {
    const textLower = (questionText + " " + category).toLowerCase();
    
    // Find best matching topic based on keyword overlap
    let bestMatch = null;
    let maxMatches = 0;

    for (const topic of this.knowledgeBase) {
      let score = 0;
      if (category && topic.category.toLowerCase() === category.toLowerCase()) {
        score += 3;
      }
      for (const kw of topic.keywords) {
        if (textLower.includes(kw.toLowerCase())) {
          score += 2;
        }
      }
      if (score > maxMatches) {
        maxMatches = score;
        bestMatch = topic;
      }
    }

    if (bestMatch && maxMatches >= 2) {
      return {
        topicId: bestMatch.id,
        category: bestMatch.category,
        verifiedDefinition: bestMatch.verifiedDefinition,
        keyConcepts: bestMatch.keyConcepts,
      };
    }

    // Default general tech context
    return {
      topicId: "general-technical",
      category: category || "Computer Science",
      verifiedDefinition: "Standard software engineering principles require clarity, technical correctness, efficiency, and edge-case consideration.",
      keyConcepts: ["Technical precision", "Clear code structure", "Performance implications", "Security & best practices"],
    };
  }

  async generateFeedback(userAnswer, questionContext = {}) {
    const { questionId, questionText = "", category = "", difficulty = "Intermediate" } = questionContext;
    const cleanAnswer = (userAnswer || "").trim();

    if (!cleanAnswer) {
      return {
        score: 0,
        grade: "F",
        feedback: "No answer was provided. Please provide a response explaining the key concepts.",
        keyStrengths: [],
        missingConcepts: ["Answer content"],
        modelAnswer: "Provide a concise explanation covering core principles.",
        ragContextUsed: "N/A",
        cached: false,
      };
    }

    // 1. Retrieve RAG Source of Truth context
    const ragContext = this.retrieveRAGContext(questionText, category);
    
    // 2. Check Cache
    const cacheKey = `ai_feedback:${cacheService.hash(questionText + "::" + cleanAnswer)}`;
    const cachedResponse = await cacheService.get(cacheKey);
    if (cachedResponse) {
      return { ...cachedResponse, cached: true };
    }

    // 3. Try Gemini API evaluation with RAG context
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const prompt = `
You are a senior technical interviewer at a top tech company.
Evaluate the candidate's answer using ONLY the verified source-of-truth knowledge context provided below.
If the candidate's answer contradicts the verified context or misses key technical concepts, reduce score appropriately and provide constructive feedback.

VERIFIED KNOWLEDGE BASE CONTEXT:
Category: ${ragContext.category}
Verified Standard Definition: ${ragContext.verifiedDefinition}
Key Expected Concepts: ${ragContext.keyConcepts.join(", ")}

QUESTION:
${questionText} (Difficulty: ${difficulty})

CANDIDATE'S ANSWER:
"${cleanAnswer}"

Provide a structured evaluation in JSON with these exact fields:
- score (number from 0 to 100)
- grade (string, e.g. "A+", "A", "B", "C", "D", "F")
- feedback (detailed constructive analysis, highlighting accuracy against knowledge base)
- keyStrengths (array of strings)
- missingConcepts (array of strings)
- modelAnswer (an ideal 2-3 sentence technical answer based on the context)
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                grade: { type: Type.STRING },
                feedback: { type: Type.STRING },
                keyStrengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                missingConcepts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                modelAnswer: { type: Type.STRING },
              },
              required: ["score", "grade", "feedback", "keyStrengths", "missingConcepts", "modelAnswer"],
            },
          },
        });

        const result = JSON.parse(response.text.trim());
        result.ragContextUsed = `${ragContext.category} Knowledge Base (${ragContext.topicId})`;
        result.cached = false;

        // Save evaluation to Redis/Memory Cache for 1 hour
        await cacheService.set(cacheKey, result, 3600);
        return result;
      } catch (err) {
        logger.warn(`[AIService] Gemini API error, falling back to heuristic RAG evaluation: ${err.message}`);
      }
    }

    // 4. Fallback Heuristic RAG Evaluation Engine (When Gemini key is absent or API unavailable)
    const evaluated = this.fallbackRAGEvaluation(cleanAnswer, questionText, ragContext);
    evaluated.cached = false;
    await cacheService.set(cacheKey, evaluated, 3600);
    return evaluated;
  }

  fallbackRAGEvaluation(answer, questionText, ragContext) {
    const textLower = answer.toLowerCase();
    let hitCount = 0;
    const strengths = [];
    const missing = [];

    for (const concept of ragContext.keyConcepts) {
      const words = concept.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const matches = words.filter((w) => textLower.includes(w));
      if (matches.length > 0) {
        hitCount++;
        strengths.push(`Addressed ${concept}`);
      } else {
        missing.push(concept);
      }
    }

    const wordCount = answer.split(/\s+/).length;
    let baseScore = Math.min(60 + hitCount * 12 + Math.min(wordCount / 2, 15), 98);
    if (wordCount < 10) baseScore = Math.min(baseScore, 50);

    let grade = "C";
    if (baseScore >= 90) grade = "A+";
    else if (baseScore >= 80) grade = "A";
    else if (baseScore >= 70) grade = "B";
    else if (baseScore >= 60) grade = "C";
    else grade = "D";

    return {
      score: Math.round(baseScore),
      grade,
      feedback: `Candidate demonstrated awareness of key principles in ${ragContext.category}. ${
        strengths.length > 0 ? "Good mention of " + strengths.join(", ") + "." : ""
      } ${
        missing.length > 0 ? "For higher score, explicitly include: " + missing.join(", ") + "." : ""
      }`,
      keyStrengths: strengths.length > 0 ? strengths : ["Attempted technical response"],
      missingConcepts: missing.length > 0 ? missing : ["In-depth edge case analysis"],
      modelAnswer: ragContext.verifiedDefinition,
      ragContextUsed: `${ragContext.category} Knowledge Base (${ragContext.topicId})`,
    };
  }
}

module.exports = new AIService();
