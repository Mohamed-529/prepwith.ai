const Progress = require("../models/Progress");
const { questions } = require("./questionsController");

// Mock AI feedback generator
const generateAIFeedback = (userAnswer, question) => {
  if (!userAnswer || userAnswer.trim().length === 0) {
    return "No answer provided. Try to explain the concept in your own words next time.";
  }

  const answerLower = userAnswer.toLowerCase();
  const matchedKeywords = question.keywords.filter((kw) =>
    answerLower.includes(kw.toLowerCase())
  );
  const score = matchedKeywords.length;
  const total = question.keywords.length;
  const percentage = Math.round((score / total) * 100);

  if (percentage >= 70) {
    return `Excellent answer! You covered key concepts like: ${matchedKeywords.join(", ")}. Your understanding is strong. Keep it up!`;
  } else if (percentage >= 40) {
    return `Good attempt! You mentioned some key points (${matchedKeywords.join(", ")}), but try to also cover: ${question.keywords
      .filter((k) => !matchedKeywords.includes(k))
      .slice(0, 3)
      .join(", ")}.`;
  } else if (percentage >= 10) {
    return `Partial answer. You touched on a few concepts, but your answer needs more depth. Review the topic and focus on: ${question.keywords
      .slice(0, 4)
      .join(", ")}.`;
  } else {
    return `This answer needs improvement. Try to include concepts like: ${question.keywords
      .slice(0, 4)
      .join(", ")}. Review the topic and try again!`;
  }
};

// Check if answer is correct (keyword-based scoring)
const evaluateAnswer = (userAnswer, question) => {
  if (!userAnswer || userAnswer.trim().length < 10) return false;

  const answerLower = userAnswer.toLowerCase();
  const matchedKeywords = question.keywords.filter((kw) =>
    answerLower.includes(kw.toLowerCase())
  );

  return matchedKeywords.length >= Math.ceil(question.keywords.length * 0.4);
};

// @desc    Submit interview answers
// @route   POST /api/submit
// @access  Private
const submitAnswers = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers array is required" });
    }

    let score = 0;
    const evaluatedAnswers = [];

    for (const answer of answers) {
      const question = questions.find((q) => q.id === answer.questionId);

      if (!question) {
        evaluatedAnswers.push({
          questionId: answer.questionId,
          questionText: answer.questionText || "Unknown question",
          userAnswer: answer.userAnswer || "",
          isCorrect: false,
          feedback: "Question not found.",
        });
        continue;
      }

      const isCorrect = evaluateAnswer(answer.userAnswer, question);
      const feedback = generateAIFeedback(answer.userAnswer, question);

      if (isCorrect) score++;

      evaluatedAnswers.push({
        questionId: question.id,
        questionText: question.question,
        userAnswer: answer.userAnswer || "",
        isCorrect,
        feedback,
      });
    }

    // Save progress to DB
    const progress = await Progress.create({
      userId: req.user._id,
      score,
      totalQuestions: answers.length,
      answers: evaluatedAnswers,
      date: new Date(),
    });

    res.status(200).json({
      success: true,
      score,
      totalQuestions: answers.length,
      percentage: Math.round((score / answers.length) * 100),
      answers: evaluatedAnswers,
      progressId: progress._id,
    });
  } catch (error) {
    console.error("Submit error:", error.message);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// @desc    Get user progress history
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res) => {
  try {
    const progressHistory = await Progress.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(10);

    const stats = {
      totalSessions: progressHistory.length,
      averageScore:
        progressHistory.length > 0
          ? Math.round(
              progressHistory.reduce(
                (acc, p) =>
                  acc + Math.round((p.score / p.totalQuestions) * 100),
                0
              ) / progressHistory.length
            )
          : 0,
      bestScore:
        progressHistory.length > 0
          ? Math.max(
              ...progressHistory.map((p) =>
                Math.round((p.score / p.totalQuestions) * 100)
              )
            )
          : 0,
    };

    res.status(200).json({
      success: true,
      stats,
      history: progressHistory,
    });
  } catch (error) {
    console.error("Get progress error:", error.message);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = { submitAnswers, getProgress };
