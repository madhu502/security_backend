// // importing the packages. (express.)
// const express = require("express");
// const helmet = require("helmet");
// const mongoSanitize = require("express-mongo-sanitize");
// const xss = require("xss-clean");
// const hpp = require("hpp");
// const compression = require("compression");
// const cookieParser = require("cookie-parser");
// const mongoose = require("mongoose");
// const fs = require("fs");
// const https = require("https");
// const http = require("http");

// const connectDatabase = require("./database/database");

// const dotenv = require("dotenv");

// const cors = require("cors");
// const logger = require("./utils/logger");

// const acceptFOrmData = require("express-fileupload");

// const path = require("path");
// const loggerMiddleware = require("./middleware/loggerMiddleware");

// const app = express();

// const logRoutes = require("./routes/logRoutes");
// const {
//   globalLimiter,
//   authLimiter,
//   apiLimiter,
// } = require("./middleware/rateLimiter");
// app.use(helmet());

// // Prevent XSS attacks
// app.use(xss());

// // Sanitize data
// app.use(mongoSanitize());

// // Prevent http param pollution
// app.use(hpp());

// // Compress responses
// app.use(compression());

// //configure cors policy
// const corsOptions = {
//   origin: "https://localhost:3000",
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   exposedHeaders: ["Content-Range", "X-Content-Range"],
//   maxAge: 600,
//   optionSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

// app.use(express.json({ limit: "10kb" }));
// app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// // cookie parser with secure options
// app.use(
//   cookieParser(process.env.COOKIE_SECRET, {
//     httpOnly: true,
//     secure: "production",
//     sameSite: "strict",
//     maxAge: 24 * 60 * 60 * 1000,
//   })
// );
// // logger middleware
// app.use(loggerMiddleware);

// // rate limiter
// app.use(globalLimiter);
// // config from data
// app.use(acceptFOrmData());
// // app.use(multiparty());

// //dotenv configuration
// dotenv.config();

// // make static form data
// app.use(express.static(path.join(__dirname, "./public")));

// //defining the port .
// const PORT = process.env.PORT;

// //connecting to databas
// connectDatabase();

// //making a  endpoint.
// app.get("/test", (req, res) => {
//   res.status(200);
//   res.send("HTTPS is working on localhost!");
// });

// //configuring routes
// app.use("/api/user", require("./routes/userRoutes"));
// app.use("/api/user/login", authLimiter);
// app.use("/api/user/register", authLimiter);
// app.use("/api", apiLimiter);

// app.use("/api/category", require("./routes/categoryRoutes"));
// app.use("/api/product", require("./routes/productRoutes"));
// app.use("/api/cart", require("./routes/cartRoutes"));
// app.use("/api/order", require("./routes/orderRoute"));
// app.use("/api/address", require("./routes/addressRoute"));
// app.use("/api/review", require("./routes/reviewRoutes"));
// // app.use('/api/review', require('./routes/reviewRoutes'))

// app.use("/api/logs", logRoutes);

// // HTTPS options (read your certificate and key files)
// const httpsOptions = {
//   key: fs.readFileSync("certificates/server.key"),
//   cert: fs.readFileSync("certificates/server.crt"),
// };
// // Create HTTPS server
// const httpsServer = https.createServer(httpsOptions, app);

// const httpApp = express();
// httpApp.use((req, res) => {
//   res.redirect(`https://${req.headers.host}${req.url}`);
// });

// const httpServer = http.createServer(httpApp);
// // Define ports
// const HTTPS_PORT = process.env.HTTPS_PORT || 443; // Default HTTPS port is 443
// const HTTP_PORT = process.env.PORT || 80; // Default HTTP port is 80

// // Start HTTPS server
// httpsServer.listen(HTTPS_PORT, () => {
//   console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
// });

// module.exports = app;

// Importing the packages
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
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("./utils/logger");
const expressFileUpload = require("express-fileupload");
const path = require("path");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const {
  globalLimiter,
  authLimiter,
  apiLimiter,
} = require("./middleware/rateLimiter");

// Load environment variables
dotenv.config();

// App initialization
const app = express();

// Security headers using Helmet
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "https://localhost:3000"],
//       },
//     },
//     referrerPolicy: { policy: "no-referrer" },
//   })
// );

// Data sanitization against XSS and NoSQL injection
app.use(xss());
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// Compress responses
app.use(compression());

// CORS Configuration
const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
  // origin: (origin, callback) => {
  //   const allowedOrigins = ["http://localhost:3000", "https://localhost:3000"];
  //   if (!origin || allowedOrigins.includes(origin)) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error("Not allowed by CORS"));
  //   }
  // },
  // credentials: true,
  // methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  // allowedHeaders: [
  //   "Content-Type",
  //   "Authorization",
  //   "Accept",
  //   "X-Requested-With",
  //   "Origin",
  // ],
  // maxAge: 600, // Cache preflight responses
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight OPTIONS requests

// Parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser with secure options
app.use(
  cookieParser(process.env.COOKIE_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  })
);

// Logger middleware
app.use(loggerMiddleware);

// Rate limiter
app.use(globalLimiter);

// File upload configuration
app.use(
  expressFileUpload({
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
    abortOnLimit: true,
    safeFileNames: true,
    preserveExtension: true,
  })
);

// Static file serving with CORS headers
// app.use(
//   "/products",
//   express.static(path.join(__dirname, "./public/products"), {
//     setHeaders: (res) => {
//       res.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
//       res.setHeader("Access-Control-Allow-Credentials", "true");
//     },
//   })
// );
app.use(express.static(path.join(__dirname, "./public")));

// Database connection
const connectDatabase = require("./database/database");
connectDatabase();

// Test endpoint
app.get("/test", (req, res) => {
  res.status(200).send("HTTPS is working on localhost!");
});

// API routes
app.use("/api/user", authLimiter, require("./routes/userRoutes"));
app.use("/api", apiLimiter);
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/address", require("./routes/addressRoute"));
app.use("/api/review", require("./routes/reviewRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// HTTPS server options
const httpsOptions = {
  key: fs.readFileSync("certificates/server.key"),
  cert: fs.readFileSync("certificates/server.crt"),
};

// HTTPS server
const httpsServer = https.createServer(httpsOptions, app);

// HTTP to HTTPS redirect
const httpApp = express();
httpApp.use((req, res) => {
  res.redirect(`https://localhost:${process.env.HTTPS_PORT}${req.url}`);
});
const httpServer = http.createServer(httpApp);

// Ports
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const HTTP_PORT = process.env.PORT || 80;

// Start servers
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server is running on https://localhost:${HTTPS_PORT}`);
});

// httpServer.listen(HTTP_PORT, () => {
//   console.log(`HTTP Server is redirecting to HTTPS on port ${HTTP_PORT}`);
// });

module.exports = app;
