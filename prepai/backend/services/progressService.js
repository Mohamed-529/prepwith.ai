const Progress = require("../models/Progress");
const questionService = require("./questionService");
const AppError = require("../utils/AppError");

class ProgressService {
  async processAndSaveAnswers({ userId, answers }) {
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      throw new AppError("An array of answers is required", 400);
    }

    const evaluatedAnswers = [];
    let totalScoreSum = 0;
    let correctCount = 0;

    for (const item of answers) {
      const evaluation = await questionService.evaluateAnswer(item.questionId, item.userAnswer || "");
      const isCorrect = evaluation.score >= 70;
      if (isCorrect) correctCount++;
      totalScoreSum += evaluation.score;

      evaluatedAnswers.push({
        questionId: item.questionId,
        questionText: item.questionText || "Question " + item.questionId,
        userAnswer: item.userAnswer || "",
        isCorrect,
        score: evaluation.score,
        grade: evaluation.grade,
        feedback: evaluation.feedback,
        keyStrengths: evaluation.keyStrengths || [],
        missingConcepts: evaluation.missingConcepts || [],
        modelAnswer: evaluation.modelAnswer || "",
        ragContextUsed: evaluation.ragContextUsed || "General Knowledge Base",
      });
    }

    const totalQuestions = answers.length;
    const averagePercentage = Math.round(totalScoreSum / totalQuestions);

    const progressRecord = await Progress.create({
      userId,
      score: correctCount,
      percentage: averagePercentage,
      totalQuestions,
      answers: evaluatedAnswers,
      date: new Date(),
    });

    return {
      _id: progressRecord._id,
      score: correctCount,
      totalQuestions,
      percentage: averagePercentage,
      answers: evaluatedAnswers,
    };
  }

  async getUserProgress(userId) {
    const history = await Progress.find({ userId });

    let totalPercentage = 0;
    let totalTests = history.length;
    let highestScore = 0;

    history.forEach((item) => {
      const pct = item.percentage !== undefined 
        ? item.percentage 
        : (item.totalQuestions > 0 && item.score <= item.totalQuestions ? Math.round((item.score / item.totalQuestions) * 100) : item.score);
      totalPercentage += pct;
      if (pct > highestScore) highestScore = pct;
    });

    const averageScore = totalTests > 0 ? Math.round(totalPercentage / totalTests) : 0;

    return {
      history,
      stats: {
        totalSessions: totalTests,
        averageScore,
        bestScore: highestScore,
      },
      analytics: {
        totalTestsCompleted: totalTests,
        averageScore,
        highestScore,
      },
    };
  }
}

module.exports = new ProgressService();
