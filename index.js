// importing the packages. (express.)
const express = require("express");
// importing the packages. (mangoose.)
const mongoose = require("mongoose");
// importing the data base
const connectDatabase = require("./database/database");
// importing the dotenv
const dotenv = require("dotenv");
// importing cors  to link with frontend (its a policy)
const cors = require("cors");
// importing express-fileupload
const acceptFOrmData = require("express-fileupload");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const {
  globalLimiter,
  authLimiter,
  apiLimiter,
} = require("./middleware/rateLimiter");
// creating an express application.
const app = express();
app.use(express.json());

// Logger middleware
app.use(loggerMiddleware);

// Rate limiter
app.use(globalLimiter);
//configure cors policy
const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

//dotenv configuration
dotenv.config();

// config from data
app.use(acceptFOrmData());
// make static form data
app.use(express.static("./public"));

//defining the port .
const PORT = process.env.PORT;

//connecting to databas
connectDatabase();

//making a test endpoint.
app.get("/test", (req, res) => {
  res.status(200);
  res.send("Hello World, test api is working.");
});

//configuring routes
app.use("/api/user", authLimiter, require("./routes/userRoutes"));

app.use("/api", apiLimiter);
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/address", require("./routes/addressRoute"));
app.use("/api/review", require("./routes/reviewRoutes"));
// app.use('/api/review', require('./routes/reviewRoutes'))
app.get("/api/auth/validate-token", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ success: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// starting the server.
app.listen(PORT, () => {
  console.log(`Server - app is running on port ${PORT}`);
});

module.exports = app;
