// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];
var mongoose = require("mongoose");

// Requiring our Note and Article models
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/scrape-o-matic");
// mongoose.connect("mongodb://heroku_dvl0nfm5:6n7v10g09fu96k9r3pbatc2fti@ds139844.mlab.com:39844/heroku_dvl0nfm5");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

module.exports = function(app) {

  // Scrape data from one site and place it into the mongodb db
  app.get("/scrape", function(req, res) {
    // Make a request for the news section of buzzfeed
    request("https://www.buzzfeed.com/news?utm_term=.vs455WN8dD#.th2aaG6XOL", function(error, response, html) {
      // Load the html body from request into cheerio
      var $ = cheerio.load(html);
      var newArticles = [];
      // For each element with a "title" class
      $(".xs-px05").each(function(i, element) {

        // Save an empty result object
        var result = {};
        var homeLink = "https://www.buzzfeed.com";

        result.title = $(element).find("a").find("h2").text();
        result.summary = $(element).find("a").find("p").text();
        result.link = homeLink + $(element).children("a").attr("href");

        var entry = new Article(result);

        // Now, save that entry to the db
        entry.save(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          // Or log the doc
          else {
            console.log(doc);
          }
        });
      });
      res.redirect("/");
    });
  });

  // Grabs all the articles that were scraped and not saved
  app.get("/", function(req, res) {
    Article.find({}, function(error, data) {
      var hbsObject = {
        articles: data
      };
      res.render("index", hbsObject);
    });   
  });

  // This will get the articles we scraped from the mongoDB
  app.get("/articles", function(req, res) {

    Article.find({}, function(error, doc) {
      if (error){
        res.send(error);
      } else {
        res.send(doc);
      }
    })
  });

  // Grabs all the saved articles
  app.get("/saved", function(req, res) {
    Article.find({})
      .populate("note")
      .exec(function(error, doc) {
        if (error) {
          res.send(error);
        } else {
          var hbsObject = {
            articles: doc
          };
          res.render("saved", hbsObject);
        }
    });
  });

  app.put("/:id", function(req, res) {
    Article.findOneAndUpdate({ 
      _id: req.params.id 
    }, {
      $set: {
        saved: true
      }
    }, { new: true}, function(err, updated) {
      if(err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    })
  })

  // This deletes selected articles when button is pressed
  app.delete("/:id", function(req, res) {
    var selected = req.params.id;
    Article.remove({
      _id: selected
    }, function(){
      res.redirect("/saved");
    });
  });

  // This deletes selected notes when button is pressed
  app.delete("/note/:id", function(req, res) {
    var selected = req.params.id;
    Note.remove({
      _id: selected
    }, function(){
      res.redirect("/saved");
    });
  });

  // Create a new note or replace an existing note
  app.post("/articles/:id", function(req, res) {
    var newNote = new Note(req.body);
    newNote.save(function(error, doc) {
      if (error) {
        res.send(error);
      } else {
        Article.findOneAndUpdate({ _id: req.params.id }, { $push: { "note": doc._id } }, { new: true })
          .exec(function(err, doc) {
            if (err) {
              res.send(err);
            } else {
              res.redirect("/saved");
            }
        }) 
      }
    })
  });
};

