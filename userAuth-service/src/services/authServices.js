const User = require("../models/userSchema.js");
const jwt = require("jsonwebtoken");

exports.createUser = async (userData) => {
  try {
    return await User.create(userData);
  } catch (error) {
    console.error("Error in createUser service:", error);
    throw new Error("Failed to create user");
  }
};

exports.findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.error("Error in findUserByEmail service:", error);
    throw new Error("Failed to find user by email");
  }
};

exports.findUserByToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findOne({ email: decoded.email });
  } catch {
    return null; 
  }
};

