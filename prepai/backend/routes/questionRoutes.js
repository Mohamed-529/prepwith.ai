const express = require("express");
const { z } = require("zod");
const router = express.Router();
const { getQuestions, evaluateAnswer } = require("../controllers/questionsController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validationMiddleware");

const evaluateSchema = {
  body: z.object({
    questionId: z.union([z.string(), z.number()]),
    answer: z.string().min(1, "Answer cannot be empty"),
  }),
};

router.get("/", protect, getQuestions);
router.post("/evaluate", protect, validateRequest(evaluateSchema), evaluateAnswer);

module.exports = router;
