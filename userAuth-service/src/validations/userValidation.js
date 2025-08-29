const Joi = require("joi");

exports.createUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).required().messages({
    "string.base": "First name must be a string",
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().min(2).required().messages({
    "string.base": "Last name must be a string",
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 2 characters",
    "any.required": "Last name is required",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Enter a valid email address",
    "any.required": "Email is required",
  }),
  role: Joi.string().valid("user", "admin").default("user").messages({
    "any.only": "Role must be either user or admin",
  }),
});

exports.loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

exports.setPasswordSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

exports.resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match password",
    "string.empty": "Confirm password is required",
    "any.required": "Confirm password is required",
  }),
});

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Enter a valid email address",
    "any.required": "Email is required",
  }),
});

exports.updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).optional().messages({
    "string.base": "First name must be a string",
    "string.min": "First name must be at least 2 characters",
  }),
  lastName: Joi.string().trim().min(2).optional().messages({
    "string.base": "Last name must be a string",
    "string.min": "Last name must be at least 2 characters",
  }),
  email: Joi.string().trim().email().optional().messages({
    "string.base": "Email must be a string",
    "string.email": "Enter a valid email address",
  }),
  profileImage: Joi.string().optional().messages({
    "string.base": "Profile image must be a string",
  }),
  role: Joi.string().valid("user", "admin").optional().messages({
    "any.only": "User Can not update role",
  }),
});

exports.objectIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    "string.pattern.base": "Invalid MongoDB ID",
    "any.required": "ID is required",
  });


