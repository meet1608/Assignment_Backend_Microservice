const User = require("../models/userSchema.js");
const mongoose = require("mongoose");

const userprint = {
  $project: {
    id: "$_id",
    email: 1,
    firstName: 1,
    lastName: 1,
    profileImage: 1,
    role: 1,
    createdAt: 1,
    updatedAt: 1,
    isEmailVerified: 1,
    isDeleted: 1,
  },
};

exports.getAllUsers = async (search, page = 1, limit = 10, excludeId) => {
  try {
    const matchStage = {
      isDeleted: false,
      _id: { $ne: new mongoose.Types.ObjectId(excludeId) }, //by doing this we can get all users except the logged in user
    };
    if (search) {
      const words = search.trim().split(/\s+/).filter(Boolean);
      matchStage.$or = words.flatMap((word) => [
        { firstName: { $regex: word, $options: "i" } },
        { lastName: { $regex: word, $options: "i" } },
        { email: { $regex: word, $options: "i" } },
      ]);
    }

    const countResult = await User.aggregate([
      { $match: matchStage },
      { $count: "total" },
    ]);
    const total = countResult[0] ? countResult[0].total : 0;

    const users = await User.aggregate([
      { $match: matchStage },
      { $sort: { updatedAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      userprint,
    ]);

    return { users, total };
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    throw new Error("Failed to get all users");
  }
};

exports.getUserById = async (id) => {
  try {
    const result = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      userprint,
    ]);

    return result[0] || null;
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw new Error("Failed to get user by id");
  }
};

exports.findUserByIdAndUpdate = async (id, updateData) => {
  try {
    const ObjectId = mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : null;

    if (!ObjectId) {
      return null; //when id is not valid
    }
    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) return null; // User not found

    if (updated.isDeleted === true) {
      return { isDeleted: true };
    }

    const result = await User.aggregate([
      { $match: { _id: ObjectId } },
      userprint,
    ]);

    return result[0] || null;
  } catch (error) {
    console.error("Error in findUserByIdAndUpdate:", error);
    throw new Error("Failed to update user by id");
  }
};
