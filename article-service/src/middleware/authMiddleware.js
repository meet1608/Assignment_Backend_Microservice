const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try{
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).json({ sucess: false,error :"NO_TOKEN",message: "Access Denied. No Token Provided." });
  }

  const token = authHeader.split(" ")[1];

  
    jwt.verify(token, process.env.JWT_SECRET,(err, decoded) => {
      if(err){
        let errorType = "INVALID_TOKEN";
        if (err.name === "TokenExpiredError") {
          errorType = "TOKEN_EXPIRED";
        }
        else if (err.name === "JsonWebTokenError") {
          errorType = "INVALID_TOKEN";
        }
        else if (err.name === "NotBeforeError") {
          errorType = "TOKEN_NOT_ACTIVE";
        }
        return res.status(403).json({sucess:false,error:errorType, message: "Invalid or Expired Token"|| err.message,error:err.message});
        
      }
      req.user = decoded; 
    next();
    });
    
  } catch (error) {
    console.error("Jwt Middleware Error:", error);
    return res.status(500).json({ sucess: false,error :"SERVER_ERROR",message: "Error during Authentication" });
  }
};

module.exports = authenticateToken;
