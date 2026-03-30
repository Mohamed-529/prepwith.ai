const express = require("express");
const router = express.Router();
const { getQuestions } = require("../controllers/questionsController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getQuestions);

module.exports = router;
