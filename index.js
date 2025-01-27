// importing the packages. (express.)
const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const https = require("https");
const http = require("http");

const connectDatabase = require("./database/database");

const dotenv = require("dotenv");

const cors = require("cors");
const logger = require("./utils/logger");

const acceptFOrmData = require("express-fileupload");

const path = require("path");
const loggerMiddleware = require("./middleware/loggerMiddleware");

const app = express();

const logRoutes = require("./routes/logRoutes");
const {
  globalLimiter,
  authLimiter,
  apiLimiter,
} = require("./middleware/rateLimiter");
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Sanitize data
app.use(mongoSanitize());

// Prevent http param pollution
app.use(hpp());

// Compress responses
app.use(compression());

//configure cors policy
const corsOptions = {
  origin: "https://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 600,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// cookie parser with secure options
app.use(
  cookieParser(process.env.COOKIE_SECRET, {
    httpOnly: true,
    secure: "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  })
);
// logger middleware
app.use(loggerMiddleware);

// rate limiter
app.use(globalLimiter);
// config from data
app.use(acceptFOrmData());
// app.use(multiparty());

//dotenv configuration
dotenv.config();

// make static form data
app.use(express.static(path.join(__dirname, "./public")));

//defining the port .
const PORT = process.env.PORT;

//connecting to databas
connectDatabase();

//making a  endpoint.
app.get("/test", (req, res) => {
  res.status(200);
  res.send("HTTPS is working on localhost!");
});

//configuring routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);
app.use("/api", apiLimiter);

app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/address", require("./routes/addressRoute"));
app.use("/api/review", require("./routes/reviewRoutes"));
// app.use('/api/review', require('./routes/reviewRoutes'))

app.use("/api/logs", logRoutes);

// HTTPS options (read your certificate and key files)
const httpsOptions = {
  key: fs.readFileSync("certificates/server.key"),
  cert: fs.readFileSync("certificates/server.crt"),
};
// Create HTTPS server
const httpsServer = https.createServer(httpsOptions, app);

const httpApp = express();
httpApp.use((req, res) => {
  res.redirect(`https://${req.headers.host}${req.url}`);
});

const httpServer = http.createServer(httpApp);
// Define ports
const HTTPS_PORT = process.env.HTTPS_PORT || 443; // Default HTTPS port is 443
const HTTP_PORT = process.env.PORT || 80; // Default HTTP port is 80

// Start HTTPS server
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
});

module.exports = app;
