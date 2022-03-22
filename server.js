const express = require("express");
const multer = require("multer");
const { generate: uuid } = require("shortid");
const path = require("path");
require("dotenv").config();
const File = require("./models/fileModel");
const mongoose = require("mongoose");
const fs = require("fs");

// creating uploads folder if not exists
if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"));
}

// multer storage setup
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, `${uuid()}${path.extname(file.originalname)}`);
  },
});

let upload = multer({ storage });

// connect to db
const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.DB_URI);
    console.log(`connected to ${db.connection.host}`);
  } catch (error) {
    console.log(error.message);
  }
};

// connecting to db
connectDB();

const app = express();

const PORT = process.env.PORT || 8000;

app.set("view engine", "ejs");

// middlewares
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.render("index");
});

// download file
app.get("/download/:filename", async (req, res) => {
  if (!fs.existsSync(path.join(__dirname, `uploads/${req.params.filename}`))) {
    return res.render("notfound");
  }
  return res.download(path.join(__dirname, `uploads/${req.params.filename}`));
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (req.file) {
    const filename = req.file.filename;
    // saving file to db
    const file = await File.create({
      filename: filename,
      url: `https://${req.get("host")}/download/${filename}`,
    });
    // sending url in resposne
    return res.status(201).json({ status: "ok", url: file.url });
  }
  return res.status(500).json("Internal server error");
});

app.listen(PORT, () => console.log(`running on ${PORT}`));
