const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendVerificationEmail = require("../utils/sendAddPasswordEmail.js");
const userQueries = require("../services/authServices.js");
const sendResetPasswordEmail = require("../utils/sendResetPasswordEmail.js");

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;

    const existingUser = await userQueries.findUserByEmail(email);

    if (existingUser) {
      if (!existingUser.isEmailVerified) {
        return res
          .status(400)
          .json({
            message:
              "User exists but email not verified.",
          });
      }
      return res.status(400).json({ message: "Email Exists" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });

    let userRole = "user";
    if (req.user && req.user.role === "admin" && role) {
      userRole = role;
    }

    const user = await userQueries.createUser({
      firstName,
      lastName,
      email,
      role: userRole,
    });

    await sendVerificationEmail(email, token);

    res.status(201).json({
      message: "Please Check email to set password.",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await userQueries.findUserByToken(token);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.isEmailVerified = true;

    await user.save();

    res.status(200).json({ message: "Password set successfully" });
  } catch (error) {
    console.error("Error in setPassword:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userQueries.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isDeleted === true) {
      return res.status(404).json({ message: "User is soft deleted by admin" });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message:
          "Email not verified. Please check your email to set your password.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // const UserDetails = user.toObject();
    // delete UserDetails.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage ,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Unexpected server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userQueries.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    if (user.isEmailVerified === false) {
      return res.status(400).json({ message: "Email not verified" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    await sendResetPasswordEmail(email, token);

    res.status(200).json({
      message: "Password reset email sent. Please check your inbox.",
      token,
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.resetpassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await userQueries.findUserByEmail(payload.email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.isEmailVerified = true;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetpassword:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
