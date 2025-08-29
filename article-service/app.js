const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/connections/db");
const ArticleRoutes = require("./src/routes/index.js");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003; 

app.use(cors());//allow cross-origin requests from different domains means from frontend
app.use(express.json({limit: "10mb"}));//for parsing json body
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));
console.log(path.join(__dirname, "src/uploads"));//from directory to which we want to access
console.log(__dirname);//article-service means your main folder in this app.js file is

app.get("/", (req, res) => {
  res.send("Article Service is running");
});
app.use("/api", ArticleRoutes);

const server = app.listen(PORT, async () => {
  console.log(`Auth Service running on http://localhost:${PORT}`);
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection failed, shutting down...");
    process.exit(1);
  }
});

server.on("error", (error) => {
  console.error("Server error:", error.message);
});

module.exports = app;
