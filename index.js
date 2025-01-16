// importing the packages. (express.)
const express = require("express");
// importing the packages. (mangoose.)
const mongoose = require("mongoose");
const fs = require('fs');
const https = require('https');
// importing the data base
const connectDatabase = require("./database/database");
// importing the dotenv
const dotenv = require("dotenv");
// importing cors  to link with frontend (its a policy)
const cors = require("cors");
// importing express-fileupload
const acceptFOrmData = require("express-fileupload");

// creating an express application.
const app = express();
app.use(express.json());

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

// Load the SSL certificate and private key
const key = fs.readFileSync('/Users/madhu/Desktop/security_backend/server.key', 'utf8');
const cert = fs.readFileSync('/Users/madhu/Desktop/security_backend/server.csr', 'utf8');

const httpsOptions = { key, cert };

//making a  endpoint.
app.get("/", (req, res) => {
  res.status(200);
  res.send("'HTTPS is working on localhost!'");
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

// starting the server.
app.listen(PORT, () => {
  console.log(`Server - app is running on port ${PORT}`);
});

module.exports = app;
