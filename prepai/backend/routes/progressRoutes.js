const express = require("express");
const { z } = require("zod");
const router = express.Router();
const { submitAnswers, getProgress } = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validationMiddleware");

const submitSchema = {
  body: z.object({
    answers: z.array(
      z.object({
        questionId: z.union([z.string(), z.number()]),
        questionText: z.string().optional(),
        userAnswer: z.string().optional(),
      })
    ).min(1, "At least one answer must be provided"),
  }),
};

router.post("/submit", protect, validateRequest(submitSchema), submitAnswers);
router.get("/progress", protect, getProgress);

module.exports = router;
