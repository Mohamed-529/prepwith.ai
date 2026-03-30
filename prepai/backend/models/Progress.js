const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 0,
    },
    answers: [
      {
        questionId: { type: Number },
        questionText: { type: String },
        userAnswer: { type: String },
        isCorrect: { type: Boolean },
        feedback: { type: String },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);
