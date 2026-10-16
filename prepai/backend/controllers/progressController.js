const progressService = require("../services/progressService");

exports.submitAnswers = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const result = await progressService.processAndSaveAnswers({
      userId: req.user._id,
      answers,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const data = await progressService.getUserProgress(req.user._id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
