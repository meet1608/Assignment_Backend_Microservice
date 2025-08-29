const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/connections/db");
const Routes = require("./src/routes/index.js");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; 

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

app.get("/", (req, res) => {
  res.send("Auth Service is running");
});
app.use("/api", Routes);



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
