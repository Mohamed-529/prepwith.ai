const authService = require("../services/authService");

exports.registerUser = async (req, res, next) => {
  try {
    const userData = await authService.registerUser(req.body);
    res.status(201).json(userData);
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const userData = await authService.loginUser(req.body);
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
