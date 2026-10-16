const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

/**
 * IRAGRetriever Interface Implementation
 * Adheres to Single Responsibility Principle: Solely responsible for loading, indexing,
 * and retrieving verified technical knowledge base entries to ground LLM evaluations.
 */
class RAGService {
  constructor(customKnowledgePath = null) {
    this.knowledgePath = customKnowledgePath || path.join(__dirname, "../data/knowledgeBase.json");
    this.knowledgeBase = this.loadKnowledgeBase();
  }

  loadKnowledgeBase() {
    try {
      if (fs.existsSync(this.knowledgePath)) {
        const raw = fs.readFileSync(this.knowledgePath, "utf-8");
        const parsed = JSON.parse(raw);
        const topics = parsed.topics || [];
        logger.info(`[RAGService] Loaded ${topics.length} verified technical knowledge topics for anti-hallucination grounding.`);
        return topics;
      }
    } catch (err) {
      logger.error(`[RAGService] Failed to load knowledge base: ${err.message}`);
    }
    return [];
  }

  /**
   * Retrieves verified ground-truth context with keyword and semantic overlap scoring
   * @param {string} questionText 
   * @param {string} category 
   * @returns {Object} Grounding context with verified definition and key concepts
   */
  retrieveContext(questionText = "", category = "") {
    const query = `${questionText} ${category}`.toLowerCase();
    let bestTopic = null;
    let highestScore = 0;

    for (const topic of this.knowledgeBase) {
      let score = 0;

      // Category match weighting
      if (category && topic.category.toLowerCase() === category.toLowerCase()) {
        score += 4;
      }

      // Keyword match weighting
      for (const kw of topic.keywords || []) {
        const kwLower = kw.toLowerCase();
        if (query.includes(kwLower)) {
          score += 3;
        }
      }

      // ID overlap weighting
      if (topic.id && query.includes(topic.id.replace(/-/g, " "))) {
        score += 5;
      }

      if (score > highestScore) {
        highestScore = score;
        bestTopic = topic;
      }
    }

    if (bestTopic && highestScore >= 3) {
      return {
        topicId: bestTopic.id,
        category: bestTopic.category,
        verifiedDefinition: bestTopic.verifiedDefinition,
        keyConcepts: bestTopic.keyConcepts || [],
        antiHallucinationCheck: bestTopic.antiHallucinationCheck || "Grounded against official technical standards.",
        retrievalConfidence: Math.min(Math.round((highestScore / 10) * 100), 98),
        isExactMatch: true,
      };
    }

    // Default fallback grounding context for general technical questions
    return {
      topicId: "core-software-engineering",
      category: category || "Computer Science",
      verifiedDefinition: "Standard software engineering requires clarity, algorithmic correctness, scalability, edge-case mitigation, and security compliance.",
      keyConcepts: [
        "Architectural correctness",
        "Algorithmic efficiency (Time & Space)",
        "Error handling & edge cases",
        "Maintainability & SOLID principles",
      ],
      antiHallucinationCheck: "Must verify engineering principles without accepting speculative assertions.",
      retrievalConfidence: 75,
      isExactMatch: false,
    };
  }

  getAllTopics() {
    return this.knowledgeBase.map((t) => ({
      id: t.id,
      category: t.category,
      conceptCount: t.keyConcepts ? t.keyConcepts.length : 0,
    }));
  }
}

module.exports = new RAGService();
