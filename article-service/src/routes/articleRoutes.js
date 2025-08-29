const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  createArticles,
  getAllArticles,
  getArticleById,
  deleteArticleById,
  updateArticleById,
} = require("../controllers/articleController.js");
const validate = require("../middleware/validate.js");
const { createArticleSchema } = require("../validations/articleValidation.js");
const authenticateToken = require("../middleware/authMiddleware.js");
const authorizeRole = require("../middleware/roleAuth.js");
const upload = require("../middleware/fileUpload.js");

const router = express.Router();

router.post(
  "/create",
  authenticateToken,
  authorizeRole(["user", "admin"]),
  upload.fields([{ name: "articleImage", maxCount: 1 }]),
  validate(createArticleSchema),
  createArticles
);

router.get(
  "/all",
  authenticateToken,
  authorizeRole(["admin", "user"]),
  getAllArticles
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["user", "admin"]),
  updateArticleById
);

router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["user", "admin"]),
  upload.fields([{ name: "articleImage", maxCount: 1 }]),
  validate(createArticleSchema),
  updateArticleById
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRole(["user", "admin"]),
  getArticleById
);

module.exports = router;
