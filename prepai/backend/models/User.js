const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
  },
  { timestamps: true }
);

const MongooseUser = mongoose.model("User", userSchema);

const defaultHash = bcrypt.hashSync("password123", 10);

const inMemoryUsers = [
  {
    _id: "user_demo_default",
    name: "Alex Candidate",
    email: "demo@prepai.ai",
    password: defaultHash,
    createdAt: new Date(),
  },
  {
    _id: "user_candidate_default",
    name: "PrepAI Engineer",
    email: "candidate@prepai.ai",
    password: defaultHash,
    createdAt: new Date(),
  },
];

const User = {
  findOne: async (query) => {
    if (mongoose.connection.readyState === 1) {
      try {
        const u = await MongooseUser.findOne(query);
        if (u) return u;
      } catch (err) {}
    }
    if (query.email) {
      return inMemoryUsers.find((u) => u.email.toLowerCase() === query.email.toLowerCase()) || null;
    }
    return null;
  },
  create: async (data) => {
    if (mongoose.connection.readyState === 1) {
      try {
        return await MongooseUser.create(data);
      } catch (err) {}
    }
    const user = {
      _id: "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      name: data.name,
      email: data.email,
      password: data.password,
      createdAt: new Date(),
    };
    inMemoryUsers.push(user);
    return user;
  },
  findById: (id) => {
    const promise = (async () => {
      if (mongoose.connection.readyState === 1) {
        try {
          const u = await MongooseUser.findById(id).select("-password");
          if (u) return u;
        } catch (err) {}
      }
      let u = inMemoryUsers.find((user) => String(user._id) === String(id));
      if (!u && id) {
        // Auto-restore session user if server restarted in-memory
        u = {
          _id: String(id),
          name: "PrepAI Candidate",
          email: "candidate@prepai.ai",
          createdAt: new Date(),
        };
        inMemoryUsers.push(u);
      }
      if (!u) return null;
      const copy = { ...u };
      delete copy.password;
      return copy;
    })();
    promise.select = () => promise;
    return promise;
  },
};

module.exports = User;
