var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;

// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

module.exports = function(app) {

  app.get("/", function(req, res) {
    db.scrapedData.find({}, function(error, data) {
      var hbsObject = {
        articles: data
      };
      res.render("index", hbsObject);
    });
    
  });

  app.get("/saved", function(req, res) {
    db.scrapedData.find({}, function(error, data) {
      var hbsObject = {
        articles: data
      };
      res.render("saved", hbsObject);
    });
  });

  // Retrieve data from the db
  app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.json(found);
      }
    });
  });

  // Scrape data from one site and place it into the mongodb db
  app.get("/scrape", function(req, res) {
    // Make a request for the news section of ycombinator
    request("https://www.buzzfeed.com/news?utm_term=.vs455WN8dD#.th2aaG6XOL", function(error, response, html) {
      // Load the html body from request into cheerio
      var $ = cheerio.load(html);
      var newArticles = [];
      // For each element with a "title" class
      $(".xs-px05").each(function(i, element) {
        
        // Save the text and href of each link enclosed in the current element
        var homeLink = "https://www.buzzfeed.com";
        var title = $(element).find("a").find("h2").text();
        var summary = $(element).find("a").find("p").text();
        var link = homeLink + $(element).children("a").attr("href");


        
        if (title && link && summary) {
          // Insert the data in the scrapedData db
          db.scrapedData.insert({
            title: title,
            summary: summary,
            link: link,
            comments:[],
            saved: false
          },
          function(err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            }
            else {
              // Otherwise, log the inserted data
              // console.log(inserted);
            }
          });
        }
      });
      // Send a "Scrape Complete" message to the browser
    res.redirect("/");
    });

  });

  app.put("/comment/:id", function(req, res) {
    var selected = req.params.id;
    console.log("Comment says: " + JSON.stringify(req.body.comment));
    // db.scrapedData.update({
    //   _id: ObjectId(selected)
    // }, {
    // $push: {comments: req.target.comment.value}
    // }, function() {

      res.redirect("/saved");
    // })
    
  });

  app.post("/", function(req, res) {
    db.scrapedData.update({
      saved: true
    }).then(function(dbArticle) {
      res.redirect("/");
    });
  });

  app.delete("/:id", function(req, res) {
    var selected = req.params.id;
    db.scrapedData.remove({
      _id: ObjectId(selected)
    }, function(){
      res.redirect("/saved");
    });
  });

// When the Save button is pressed
  app.put("/:id", function(req, res) {
    var selected = req.params.id;
    console.log("Saved says: " + req);
    console.log("ID: " + selected);
    db.scrapedData.update({ 
      _id: ObjectId(selected)
    }, { 
      $set: { 
        saved: req.body.saved
      } 
    }, function(err, updated) {
      if (err) {
        // Log the error if one is encountered during the query
        console.log(err);
      } else {
        // Otherwise, log the inserted data
        console.log(updated);
        res.redirect("/");
      }
    });
  });
};
