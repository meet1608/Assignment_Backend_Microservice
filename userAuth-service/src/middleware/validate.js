module.exports = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  
  if (error) {
    const errors = error.details[0].message;
    return res.status(400).json({
      message: errors,
    });
  }
  
  next();
};
