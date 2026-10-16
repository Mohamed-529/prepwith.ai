const questionService = require("../services/questionService");

exports.getQuestions = async (req, res, next) => {
  try {
    const { category } = req.query;
    const questions = await questionService.getAllQuestions(category);
    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

exports.evaluateAnswer = async (req, res, next) => {
  try {
    const { questionId, answer } = req.body;
    const evaluation = await questionService.evaluateAnswer(questionId, answer);
    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
