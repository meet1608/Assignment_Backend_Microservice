const express = require("express");
require("dotenv").config();
const cors = require("cors");
const expressProxy = require("express-http-proxy"); // we use this for forwarding request from gateway to other services
const app = express();
app.use(cors());
app.use(express.json({limit: "10mb"})); //pars incoming json requests this is a middleware
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  //when rquest comes to /api/auth it will forward it to user-service
  "/api/auth",
  expressProxy("http://localhost:5001", {
    proxyReqPathResolver: (req) => {
      return `/api/auth${req.url}`;
    },
    limit: "10mb",
  })
);

app.use(
  "/api/users",
  expressProxy("http://localhost:5001", {
    proxyReqPathResolver: (req) => {
      return `/api/users${req.url}`;
    },
    limit: "10mb",
  })
);

app.use(
  "/api/articles",
  expressProxy("http://localhost:5003", {
    proxyReqPathResolver: (req) => {
      return `/api/articles${req.url}`;
    },
    limit: "10mb",
  })
);

app.use(
  "/article-uploads",
  expressProxy("http://localhost:5003", {
    proxyReqPathResolver: (req) => {
      return `/uploads${req.url}`;
    },
    limit: "10mb",
  })
);

app.use(
  "/uploads",
  expressProxy("http://localhost:5001", {
    proxyReqPathResolver: (req) => {
      return `/uploads${req.url}`;
    },
    limit: "10mb",
  })
);

app.get("/", (req, res) => {
  res.send("API Gateway is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
