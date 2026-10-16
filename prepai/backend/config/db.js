const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.set("bufferCommands", false);
  if (!process.env.MONGO_URI) {
    console.warn("[AI Studio] MONGO_URI not provided — database running in offline/in-memory mode");
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[AI Studio] MongoDB Connection Warning: ${error.message}. Running in offline/in-memory mode.`);
  }
};

module.exports = connectDB;
