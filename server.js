// Dependencies
var express = require("express");
var mongojs = require("mongojs");

var bodyParser = require("body-parser");
var methodOverride = require("method-override");

// Initialize Express
var app = express();

var PORT = process.env.PORT || 3000;

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
require("./controllers/articleController.js")(app);

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
