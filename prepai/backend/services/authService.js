const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

class AuthService {
  generateToken(id) {
    const secret = process.env.JWT_SECRET || "prepai_default_secret_key_2026";
    return jwt.sign({ id }, secret, { expiresIn: "30d" });
  }

  async registerUser({ name, email, password }) {
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      throw new AppError("User already exists with this email address.", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
    });

    const token = this.generateToken(user._id);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    };
  }

  async loginUser({ email, password }) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = this.generateToken(user._id);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    };
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User profile not found", 404);
    }
    return user;
  }
}

module.exports = new AuthService();
