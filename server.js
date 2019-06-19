const express = require("express"),
  aws = require("aws-sdk"),
  bodyParser = require("body-parser"),
  multer = require("multer"),
  multerS3 = require("multer-s3");

const cors = require("cors");

aws.config.update({
  secretAccessKey: "lt+MzW+sMl2d+nnoZH15M7cF3olR3MJs9HMIHoor",
  accessKeyId: "AKIAIFNFR2W5F3F66D4A",
  region: "ap-south-1"
});

const app = express(),
  s3 = new aws.S3();

app.use(bodyParser.json());
app.use(cors());


const path = require('path')

const mongoURI = "mongodb://user:user123@ds237357.mlab.com:37357/images",

  mongoose = require("mongoose");

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "floor-detection-images",
    acl: "public-read",
    metadata: function(req, res, cb) {
      cb(null, { fieldName: "testing" });
    },
    key: function(req, file, cb) {
      cb(null, file.originalname); //use Date.now() for unique file keys
    }
  })
});

const singleUpload = upload.single("image");

const urlArray = [];

const algorithmia = require("algorithmia");

const URL = require("./models/URL");

//open in browser to see upload form
// app.get('/', function (req, res) {
//     res.sendFile(__dirname + '/index.html');//index.html is inside node-cheat
// });

//use by upload form
app.post("/upload", function(req, res) {
  singleUpload(req, res, function(err) {
    console.log("imageurl", req.file.location);

    const newURL = new URL({
      url: req.file.location
    });

    newURL.save().then(url => console.log(url));

    return res.json({ imageUrl: req.file.location });
  });
});

app.post("/floordetection", function(req, res) {
  console.log("detecting floors");
  input = { file: req.body.file, floor_only: req.body.floor_only };

  algorithmia
    .client("simV0KqI9ACbVI+NFOjBaf5M7+b1")
    .algo("godmode/flooring_detection/0.1.2") // timeout is optional
    .pipe(input)
    .then(function(response) {
      console.log("response", response.get());
      res.send(response.get());
    });
});

app.get("/listUploadedImages", function(req, res) {
  console.log('listing imagess')
  URL.find()
    .sort({ date: -1 })
    .then(urls => res.send(urls));
});


if(process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

app.listen(5000, function() {
  console.log("app listening on port 5000!");
});
