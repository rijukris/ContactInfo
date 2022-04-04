var fs = require("fs");
var path = require("path");
var http = require("http");
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
	password: "Disney!23",
	database: "ContactInfo",
});

var dbCon;
var totalCount;

/*********************************************************
var Movies = [
{
	name: "Jurassic Park",
	timings: ["5.00PM", "10:00PM"],
	capacity: 100,
	available: 100, 
},
{
	name: "SpiderMan",
	timings: ["1.00PM", "3:00PM"],
	capacity: 50,
	available: 50, 
},
{
	name: "SuperMan",
	timings: ["10.00AM", "4:00PM"],
	capacity: 50,
	available: 50, 
},
{
	name: "Harry Potter",
	timings: ["9.00AM", "12:30PM"],
	capacity: 100,
	available: 100, 
}];

app.get("/movies", function(req, res) {
	var mlist = "";
	Movies.forEach(function(m){
		mlist += m.name + ",";
	});
	return res.json({"status": "OK", "movies": mlist });
});

app.get("/movies/timings/:name", function(req, res) {
	Movies.forEach(function(m){
		if (m.name == req.params.name)
			return res.json({"status": "OK", "timings": m.timings });
	});
});

app.get("/movies/availability/:name", function(req, res) {
	Movies.forEach(function(m){
		if (m.name == req.params.name)
			return res.json({"status": "OK", "available": m.available });
	});
});

app.post("/movies/:name/:count", function(req, res) {
	Movies.forEach(function(m){
		if (m.name == req.params.name && m.available >= req.params.count)
		{
			m.available -= req.params.tickets;
			console.log(req.url, m.name, m.available, req.paras.count);
			return res.json({"status": "OK", "message": "Thank you. " + req.params.count + " have been booked" });
		}
	});
});

*********************************************************/

app.get("/", function(req, res) {
	return res.render('index.html');
});

app.get("/home", function(req, res) {
	fs.readFile("views/home.html", "utf-8", function(ferr, tpl) {
		if (ferr)
			res.json({"status": "ERROR", message: ferr.message});
		else
			return res.json({"status": "OK", "html": tpl});
	});
});

app.get("/addContactForm", function(req, res) {
	console.log(req.method, req.url);
	return res.render('addContactForm.html');
});

app.get("/modifyMobileForm", function(req, res) {
	console.log(req.method, req.url);
	return res.render('modifyMobileForm.html');
});

app.get("/deleteMobileForm", function(req, res) {
	console.log(req.method, req.url);
	return res.render('deleteMobileForm.html');
});

app.get("/modifyContactForm", function(req, res) {
	console.log(req.method, req.url, req.query.mobile);
	var queryStr = "SELECT * from CONTACT where mobile=" + req.query.mobile;
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": "Contact info for " + req.query.mobile + " failed with " + err.message });
		}
		else
		{
			if (rows.length > 0)
			{
				fs.readFile("views/modifyContactForm.html", "utf-8", function(ferr, tpl) {
					if (ferr)
						res.json({"status": "ERROR", message: ferr.message});
					else
					{
						var html = ejs.render(tpl, { data: rows[0] });
						return res.json({"status": "OK", contact: rows[0], "html": html});
					}
				});
			}
			else
			{
				return res.json({ "status": "ERROR", "message": "Contact info for " + req.query.mobile + " does not exist."});
			}
		}
	});
});

app.get("/deleteContactForm", function(req, res) {
	console.log(req.method, req.url, req.query.mobile);
	var queryStr = "SELECT * from CONTACT where mobile=" + req.query.mobile;
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": "Contact info for " + req.query.mobile + " failed with " + err.message });
		}
		else
		{
			if (rows.length > 0)
			{
				fs.readFile("views/deleteContactForm.html", "utf-8", function(ferr, tpl) {
					if (ferr)
						res.json({"status": "ERROR", message: ferr.message});
					else
					{
						var html = ejs.render(tpl, { data: rows[0] });
						return res.json({"status": "OK", contact: rows[0], "html": html});
					}
				});
			}
			else
			{
				return res.json({ "status": "ERROR", "message": "Contact info for " + req.query.mobile + " does not exist."});
			}
		}
	});
});

app.get("/display", function(req, res) {
	console.log(req.method, req.url);
	var queryStr = "SELECT * from CONTACT";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": err.message });
		}
		else
		{
			fs.readFile("views/display.html", "utf-8", function(ferr, tpl) {
				if (ferr)
					res.json({"status": "ERROR", message: ferr.message});
				else
				{
					var html = ejs.render(tpl, { data: rows });
					return res.json({"status": "OK", "html": html});
				}
			});
		}
	});
});

app.get("/browse", function(req, res) {
	console.log(req.method, req.url);
	var queryStr = "SELECT * from CONTACT";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": err.message });
		}
		else
		{
			fs.readFile("views/browse.html", "utf-8", function(ferr, tpl) {
				if (ferr)
					res.json({"status": "ERROR", message: ferr.message});
				else
				{
					var html = ejs.render(tpl, {});
					return res.json({"status": "OK", "html": tpl, "contacts": rows});
				}
			});
		}
	});
});

app.get("/search", function(req, res) {
	console.log(req.method, req.url);
	var queryStr = "SELECT * from CONTACT";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": err.message });
		}
		else
		{
			fs.readFile("views/browse.html", "utf-8", function(ferr, tpl) {
				if (ferr)
					res.json({"status": "ERROR", message: ferr.message});
				else
				{
					var searchRes = [];
					rows.forEach(function(r) {
						var str = Object.values(r).join(" ").toLowerCase();
						console.log("str=" + str);
						if (str.indexOf(req.query.pattern.toLowerCase()) != -1)
							searchRes.push(r);
					});
					var html = ejs.render(tpl, {});
					console.log("searchRel: " + searchRes.length);
					return res.json({"status": "OK", "html": tpl, "contacts": searchRes});
				}
			});
		}
	});
});

app.post("/addContact", function(req, res) {
	console.log(req.method, req.url, req.body.first_name);
	var queryStr = "INSERT into CONTACT values (" + req.body.mobile + ", '" + req.body.first_name + "', '" 
				 + req.body.last_name + "', '" + req.body.address + "', '" 
				 + req.body.city + "', '" + req.body.state + "', " + req.body.zip + ")";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
			return res.json({ "status": "ERROR", "message": "Database insert failed with " + err.message });
		else
		{
			totalCount += rows.affectedRows;
			io.emit("contact-count", { count: totalCount });
			return res.json({ "status": "OK", "message": "Contact info for " + req.body.mobile + " saved." });
		}
	});
});

app.put("/modifyContact", function(req, res) {
	console.log(req.method, req.url, req.body.first_name);
	var queryStr = "UPDATE CONTACT set first_name='" + req.body.first_name + "', last_name='"+ req.body.last_name + "', address='"
			 + req.body.address + "', city='"+ req.body.city + "', state='" + req.body.state + "', zip="
			 + req.body.zip + " where mobile=" + req.body.mobile + "";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": "Database update failed with " + err.message });
		}
		else
		{
			if (rows.affectedRows > 0)
				return res.json({ "status": "OK", "message": "Contact info for " + req.body.mobile + " updated." });
			else
				return res.json({ "status": "ERROR", "message": "Contact info for " + req.body.mobile + " does not exist." });
		}
	});
});

app.delete("/deleteContact", function(req, res) {
	console.log(req.method, req.url, req.body.first_name);
	var queryStr = "delete from CONTACT where mobile=" + req.body.mobile;
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
		{
			return res.json({ "status": "ERROR", "message": "Database delete failed with " + err.message });
		}
		else
		{
			if (rows.affectedRows > 0)
			{
				totalCount -= rows.affectedRows;
				io.emit("contact-count", { count: totalCount });
				return res.json({ "status": "OK", "message": "Contact info for " + req.body.mobile + " deleted." });
			}
			else
				return res.json({ "status": "ERROR", "message": "Contact info for " + req.body.mobile + " does not exist." });
		}
	});
});

function getContactCount(cb)
{
	var queryStr = "SELECT * from CONTACT";
	console.log(queryStr);
	dbCon.query(queryStr, function(err, rows, fields) {
		if (err)
			return cb(err, null);
		else
			return cb(null, rows.length);
	});
}

var server = http.createServer(app);
var io = require("socket.io")(server);

server.listen(3000, function() {
	console.log("Server listening on port 3000");

	pool.getConnection(function(err, con) {
		if (err)
		{
			console.log(err.message);
			process.exit(1);
		}
		else
		{
			dbCon = con;
			io.on('connection', function(socket) {
				getContactCount(function(err, count) {
					totalCount = count;
					io.emit("contact-count", { count: count });
				});
			});
		}
	});
});
