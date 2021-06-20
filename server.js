'use strict';

require('dotenv').config();

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var path = require('path');

var cors = require('cors');

var app = express();

var Schema = mongoose.Schema;

var urlSchema = new Schema ({
  original_url: String,
  short_url: String
});

var url = mongoose.model('url', urlSchema);

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log("DB Connected"));

mongoose.connection.on("error", err => {
  console.log(`DB connection error: ${err.message}`);
});
// mongoose.connect("mongodb+srv://Shaikot:01716330332@cluster1-dfj3n.mongodb.net/test?retryWrites=true&w=majority", {
//   useNewUrlParser: true, useUnifiedTopology: true
// });

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint...
app.post("/api/shorturl/new", async function (req, res) {
  var originalurl = req.body.url;
  var shorturl = Math.floor(Math.random()*100000).toString();
  var checkurl = /^((https?):\/\/)?([w|W]{3}\.)+[a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;

  var urlSave = new url({
    original_url: originalurl,
    short_url: shorturl
  });

  var createAndSave = await urlSave.save();

  if (checkurl.test(originalurl) === true) {
    return res.json({ original_url: createAndSave.original_url, short_url: createAndSave.short_url });
  }
  else {
    return res.json({ "error": "invalid URL" });
  }
});

app.get("/api/shorturl/:new", async function (req, res) {
  var shorterurl = req.params.new;
  url.findOne({short_url: shorterurl}, function (err, data) {
    if (err) {
      return res.send("Error reading database");
    }
    var regex = new RegExp (("^(http||https)://"), "i");
    if (regex.test(data.original_url) === true) {
      res.redirect(301, data.original_url);
    }
    else {
      res.redirect(301, "http://" + data.original_url);
    }
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});
