const userQueries = require("../services/userServices.js");
const fs = require("fs");
const path = require("path");
const Joi = require("joi");
const mongoose = require("mongoose");
exports.getAllUsers = async (req, res) => {
  try {
    const adminId = req.user.id;
    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { users, total } = await userQueries.getAllUsers(
      search,
      page,
      limit,
      adminId
    );

    res.status(200).json({
      users: users || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userid = req.params.id;
    if (!userid) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userid)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const user = await userQueries.getUserById(userid);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid User ID format" });

    const existingUser = await userQueries.getUserById(userId);
    if (!existingUser)
      return res.status(404).json({ message: "User not found" });

    

    let updateData = { ...req.body };

    if (req.user.role !== "admin" && updateData.role) {
      return res
        .status(403)
        .json({
          message: "Unauthorized: You can only update your own profile",
        });
    }

    if (req.user.role !== "admin") {
      const allowedFields = ["firstName", "lastName"];
      updateData = Object.fromEntries(
        Object.entries(updateData).filter(([key]) =>
          allowedFields.includes(key)
        )
      );
    }

    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    } else {
      updateData.profileImage = existingUser.profileImage;
    }

    if (
      req.file &&
      existingUser.profileImage 
    ) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        existingUser.profileImage
      );
      try {
        if (fs.existsSync(oldImagePath)) {
          await fs.promises.unlink(oldImagePath);
        }
      } catch (err) {
        console.error("Error deleting old profile image:", err.message);
      }
    }

    const updatedUser = await userQueries.findUserByIdAndUpdate(
      userId,
      updateData
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found after update" });

    if (updateData.isDeleted) {
      return res.status(200).json({
        message: "User soft deleted successfully",
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
