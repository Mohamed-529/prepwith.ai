const express = require("express");
const router = express.Router();
const { submitAnswers, getProgress } = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

router.post("/submit", protect, submitAnswers);
router.get("/progress", protect, getProgress);

module.exports = router;
