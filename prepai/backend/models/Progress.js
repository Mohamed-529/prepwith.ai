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
    percentage: {
      type: Number,
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

const MongooseProgress = mongoose.model("Progress", progressSchema);

const inMemoryProgress = [];

const Progress = {
  create: async (data) => {
    if (mongoose.connection.readyState === 1) {
      try {
        return await MongooseProgress.create(data);
      } catch (err) {}
    }
    const item = {
      _id: "prog_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      userId: data.userId,
      score: data.score,
      percentage: data.percentage !== undefined ? data.percentage : 0,
      totalQuestions: data.totalQuestions,
      answers: data.answers || [],
      date: data.date || new Date(),
      createdAt: new Date(),
    };
    inMemoryProgress.push(item);
    return item;
  },
  find: (query) => {
    const exec = async () => {
      if (mongoose.connection.readyState === 1) {
        try {
          return await MongooseProgress.find(query).sort({ date: -1 }).limit(10);
        } catch (err) {}
      }
      let items = inMemoryProgress.filter((p) => String(p.userId) === String(query.userId));
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      return items.slice(0, 10);
    };

    const obj = {
      sort: () => obj,
      limit: () => obj,
      then: (resolve, reject) => exec().then(resolve, reject),
      catch: (reject) => exec().catch(reject),
    };
    return obj;
  },
};

module.exports = Progress;
