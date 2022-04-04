var fs = require("fs");
var path = require("path");
var express = require("express");
var bodyParser = require('body-parser');
var ejs = require("ejs");
var mysql = require("mysql");
var app = express();

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', ejs.renderFile);

var pool = mysql.createPool({
	connectionLimit: 100,
	host: "localhost",
	user: "root",
	password: "Tibco2020",
	database: "ContactInfo",
});

app.get("/", function(req, res) {
	return res.render('index.html');
});

app.listen(3000, function() {
	console.log("Server listening on port 3000");
});

REpresentational State Transfer

REST