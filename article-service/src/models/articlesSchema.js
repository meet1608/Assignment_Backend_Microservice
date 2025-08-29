const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    articleImage: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true
    },
    type:{
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    isDeleted: {
    type: Boolean,
    default: false  
  },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Articles", articleSchema);
