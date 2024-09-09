var express = require('express');
var cors = require('cors');
require('dotenv').config()
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const fileSchema = new Schema({
  name: String,
  path: String,
  originalName: String,
  type: String,
  size: Number
});

const File = mongoose.model('File', fileSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', upload.single('upfile'), function(req, res) {

  const upfile = req.file;
  if (!upfile)
    return res.json({ error: "No file uploaded" });

  try {
    const newFile = new File({
      name: req.file.filename,
      path: req.file.path,
      originalName: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    });

    newFile.save()
      .then((file) => {
        if (!file) 
          return res.json({error : "error uploading file"});
        const returnObj = {
          name: file.name,
          type: file.type,
          size: file.size
        };
        return res.json(returnObj);
      })
      .catch((err) => {
        return res.json(err);
      });

  } catch (err) {
    return res.json(err);
  }

});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
