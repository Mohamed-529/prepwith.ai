const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authService = require("../services/authService");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET || "prepai_default_secret_key_2026";
      let decoded;

      try {
        decoded = jwt.verify(token, secret);
      } catch (verifyErr) {
        if (verifyErr.name === "TokenExpiredError") {
          // Token signature is authentic, but expired - attempt automatic sliding refresh
          try {
            decoded = jwt.verify(token, secret, { ignoreExpiration: true });
            if (decoded && decoded.id) {
              const user = await User.findById(decoded.id).select("-password");
              if (user) {
                const refreshedToken = authService.generateToken(user._id);
                res.setHeader("X-New-Token", refreshedToken);
                res.setHeader("Access-Control-Expose-Headers", "X-New-Token");
                req.user = user;
                return next();
              }
            }
          } catch (ignoreErr) {
            // Tampered or invalid token
          }
        }
        throw verifyErr;
      }

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.warn("Token verification note:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed", code: "TOKEN_EXPIRED" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
