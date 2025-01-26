// importing the packages. (express.)
const express = require("express");

const mongoose = require("mongoose");
const fs = require("fs");
const https = require("https");
const http = require("http");
// importing the data base
const connectDatabase = require("./database/database");
// importing the dotenv
const dotenv = require("dotenv");
// importing cors  to link with frontend (its a policy)
const cors = require("cors");
// importing express-fileupload
const acceptFOrmData = require("express-fileupload");
// const multiparty = require("connect-multiparty");

// creating an express application.
const path = require("path");
const app = express();
app.use(express.json());
// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src 'self'; " +
//       "script-src 'self' 'unsafe-eval'; " +
//       "style-src 'self' 'unsafe-inline'; " +
//       "img-src 'self' data:; " +
//       "font-src 'self'; " +
//       "connect-src 'self' ws://localhost:3000; " +
//       "object-src 'none'; " +
//       "frame-ancestors 'none'; " +
//       "base-uri 'self'; " +
//       "form-action 'self'; " +
//       "upgrade-insecure-requests"
//   );
//   next();
// });

//configure cors policy
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
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

// // Load the SSL certificate and private key
// const key = fs.readFileSync("localhost.key", "utf8");
// const cert = fs.readFileSync("localhost.cert", "utf8");

// // const server = https.createServer({ key, cert }, app);
// const port = process.env.PORT || 4000;

//making a  endpoint.
app.get("/test", (req, res) => {
  res.status(200);
  res.send("HTTPS is working on localhost!");
});

//configuring routes
app.use("/api/user", require("./routes/userRoutes"));

app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/address", require("./routes/addressRoute"));
app.use("/api/review", require("./routes/reviewRoutes"));
// app.use('/api/review', require('./routes/reviewRoutes'))

// // starting the server.
// app.listen(PORT, () => {
//   console.log(`Server - app is running on port ${PORT}`);
// });

// Create HTTPS server
// https.createServer(httpsOptions, app).listen(PORT, (err) => {
//   if (err) {
//     console.error(`Failed to start server: ${err.message}`);
//   } else {
//     console.log(`Server running on https://localhost:${PORT}`);
//   }
// });

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

// // Start HTTP server for redirecting to HTTPS
// httpServer.listen(HTTP_PORT, () => {
//   console.log(
//     `HTTP Server is running on port ${HTTP_PORT} and redirecting to HTTPS`
//   );
// });

// Start HTTPS server
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
});

module.exports = app;
