const authorizeRole = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: "FORBIDDEN", 
        message: "You don't have permission to access this resource" 
      });
    }
    next();
  };
};

module.exports = authorizeRole;
