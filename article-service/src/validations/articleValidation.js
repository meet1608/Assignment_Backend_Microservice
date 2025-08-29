const Joi = require("joi");

exports.createArticleSchema = Joi.object({
  title: Joi.string().min(3).required().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters long",
    "any.required": "Title is required"
  }),
  content: Joi.string().min(10).required().messages({
    "string.base": "Content must be a string",
    "string.empty": "Content is required",
    "string.min": "Content must be at least 10 characters long",
    "any.required": "Content is required"
  })
}).options({ abortEarly: false, allowUnknown: true });

//abort early is by default true we need to make this false if it is true then it will stop on the first error if we want to check multiple fields at a time we need to make it false