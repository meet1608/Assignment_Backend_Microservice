const Article = require("../models/articlesSchema.js");
const mongoose = require("mongoose");
const axios = require("axios");
const GATEWAY_API = process.env.GATEWAY_API;

const fetchUser = async (userId, token) => {
  if (!GATEWAY_API) {
    throw new Error("User service api endpoint is not set");
  }

  const { data } = await axios.get(`${GATEWAY_API}/api/users/get/${userId}`, {
    headers: { Authorization: token },
  });
  return data;
};
exports.createArticle = async (userId, body, files, token) => {
  if (!userId) throw new Error("User ID is required"); //validating user id

  const type = body.type || "draft"; //setting type to draft if type is not provided in the request body
  const { title, content } = body;

  const articleImage = files?.articleImage?.[0]
    ? `/article-uploads/${files.articleImage[0].filename}`
    : undefined; //if file exist so storing file at specified path and if not exist then undefined

  const articleData = {
    title,
    content,
    articleImage,
    type,
    user: new mongoose.Types.ObjectId(userId),
  }; //this is the object that will be stored in the mongodb

  try {
    const article = await Article.create(articleData);

    let userData = null;

    try {
      userData = await fetchUser(userId, token); //if this runs then we will get the user details from user service
    } catch (error) {
      console.error("User service is not available", error);
    }

    return {
      ...article.toObject(), //converting article to plain javascript object and then we are adding user details for response
      user: userData,
    };
  } catch (error) {
    console.error("Error in createArticle service:", error);
    throw new Error("Failed to create article");
  }
};

exports.getAllArticles = async (
  search,
  userId,
  type,
  page = 1,
  limit = 10,
  token
) => {
  try {
    const filter = { isDeleted: false }; //we only need not deleted articles so we are filtering them by user id and type
    if (userId) filter.user = userId;
    if (type && ["draft", "published"].includes(type)) filter.type = type;

    const articles = await Article.find(filter).sort({ createdAt: -1 }).lean(); //by using .lean method we will get plain javascript objects
    //query articles based on filters and sort them by newest first and this will return in plain javascript objects

    const fetchedArticles = await Promise.all(//if each articles has user id then it will return an array of fullfilled fetchUser data
      articles.map(async (article) => {//fetch full user data for each article
        try {
          const userData = await fetchUser(article.user, token);
          return { ...article, user: userData };
        } catch (err) {
          console.error(`Failed to fetch user ${article.user}:`, err.message);
          throw new Error("Failed to get all articles");
        }
      })
    );

    const filteredArticles = fetchedArticles.filter((article) => {//this part will filter articles by search terms like title,firstname and lastname and it is case insensitive
      if (!search) return true;
      const titleSearch = article.title
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const firstNameSearch = article.user?.firstName
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const lastNameSearch = article.user?.lastName
        ?.toLowerCase()
        .includes(search.toLowerCase());

      return titleSearch || firstNameSearch || lastNameSearch;
    });

    const total = filteredArticles.length;//this will give total number of articles after filtering
    const paginatedArticles = filteredArticles.slice(
      (page - 1) * limit,//this is for skipping how number of articles we want to skip for going to another page
      page * limit
    );

    return { articles: paginatedArticles, total };//this will return array of pagenated articles with user details in response
  } catch (error) {
    console.error("Error in getAllArticles service:", error);
    throw new Error("Failed to get all articles");
  }
};

exports.getArticleById = async (id, token) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;//this will validate id is a valid object or not if not return null

    const article = await Article.findOne({ _id: id, isDeleted: false }).lean();//this will find an article by id and whose isDeleted is false and return in plain javascript object
    if (!article) return null;//no article then return null

    try {
      article.user = await fetchUser(article.user, token);
    } catch (error) {
      console.error("Failed to fetch user:", error.message);
      throw new Error("Failed to get article by id");
    }

    return article;//return article with user details
  } catch (error) {
    console.error("Error in getArticleById service:", error);
    throw new Error("Failed to get article by id");
  }
};

exports.updateArticleById = async (id, updateData, token) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const updated = await Article.findByIdAndUpdate(id, updateData, {
      new: true,//returns the updated document
      runValidators: true,//validates the update data
    }).lean();

    if (!updated) return null; // Article not found

    if (updated.isDeleted === true) {//if article is marked deleted then returns isDeleted: true
      return { isDeleted: true };
    }

    try {
      updated.user = await fetchUser(updated.user, token);
    } catch (error) {
      console.error("Failed to fetch user:", error.message);
      throw new Error("Failed to update article by id");
    }
    return updated;// returns updated article with user details
  } catch (error) {
    console.error("Error in updateArticleById service:", error);
    throw new Error("Failed to update article by id");
  }
};
