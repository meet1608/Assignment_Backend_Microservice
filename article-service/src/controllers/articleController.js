const fs = require("fs");
const path = require("path");

const articleQueries = require("../services/articleServices.js");
exports.createArticles = async (req, res) => {
  try {
    const token = req.headers.authorization;//fetting token from the request header
    if (!token) return res.status(401).json({ message: "Unauthorized" });//checking token 

    const article = await articleQueries.createArticle(
      req.user.id,
      req.body,
      req.files,
      token
    );

    res.status(201).json({
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getAllArticles = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const search = req.query.search || "";
    const getAll = req.query.all === "true";
    const type = req.query.type;
    const userId = getAll ? null : req.user && req.user.id ? req.user.id : null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { articles, total } = await articleQueries.getAllArticles(
      search,
      userId,
      type,
      page,
      limit,
      token
    );

    res.status(200).json({
      message: "Articles fetched successfully",
      articles: articles || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const id = req.params.id;
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    const article = await articleQueries.getArticleById(id, token);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({
      message: "Article fetched successfully",
      article,
    });
  } catch (error) {
    console.error("Error fetching article by ID:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateArticleById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Article ID is required" });
    }
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const { title, content, type, isDeleted } = req.body;//user can update this all details

    const result = await articleQueries.updateArticleById({
      id,
      body: { title, content, type, isDeleted },
      files: req.files,
      user: req.user,
      token,
    });

   if (!result) return res.status(404).json({ message: "Article not found" });

    if (result.isDeleted)
      return res.status(200).json({ message: "Article soft deleted successfully" });
    res.status(200).json({
      message: "Article updated successfully",
      article: result,
    });
  } catch (error) {
    console.error("Error updating article by ID:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
