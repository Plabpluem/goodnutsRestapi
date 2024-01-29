const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const https = require("https");

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const locationRoutes = require("./routes/location");

const mongoUrl = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.rj8trvh.mongodb.net/${process.env.MONGO_DATABASE}`;

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getMilliseconds().toString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, "access.log"),
//   { flags: "a" }
// path.join(__dirname, "access.log"),
// { flags: "a" }
// );

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
// app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(express.static("public"));
// upload image หลายอัน
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array("image", 5)
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/auth", userRoutes);
app.use("/product", productRoutes);
app.use(locationRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    mongoUrl
  )
  .then((result) => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 8080);
    app.listen(process.env.PORT || 8080);
  })
  .catch((err) => console.log(err));
