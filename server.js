const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const request = require("request")
const cheerio = require("cheerio");
const db = require("./models");
const exphdbrs = require("express-handlebars")
const path = require("path");
const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.engine("handlebars", exphdbrs({ defaultLayout: "main" }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on("connected", function(){
    console.log("CONNECTED TO DB")
})

app.get("/scrape", function(req, res) {
    request("http://www.espn.com/esports/", function(err, response, html) {
        //working here!
        var $ = cheerio.load(html);

        $("section.contentItem__content").each(function(i, element) {
            let result = {};

            result.title = $(this).children("a").children("div").children("div").children("h1.contentItem__title--story").text();
            result.summary = $(this).children("a").children("div").children("div").children("p.contentItem__subhead--story").text();
            result.link = $(this).children("a").attr("href");
            console.log(result);

            db.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                }).catch(function(err) {
                    console.log(err);
                })
        });
        res.send("scrape complete");
    });
});

app.get("/", function(req, res) {
    db.Article.find({}).then(function(data) {
        res.render("index", { articles: data});
    });

})

app.get("/article/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function(data) {
        console.log(data);
        res.render("article", {articles: data})
    });
});

app.post("/article/:id", function(req, res) {
    db.Comment.create(req.body)
    .then(function(dbComment) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comment: dbComment._id }}, { new: true});
    })
    .then(function(dbArticle) {
        res.send(dbArticle);
    })
});

app.delete("/article/:article_id/comment/:comment_id", function(req, res) {
    db.Comment.findOneAndRemove({ _id: req.params.comment_id }, function (err) {
        if (err) {
            console.log(err);
        } else { 
        db.Article.findOneAndUpdate({ _id: req.params.article_id }, { $pull: {comment: req.params.comment_id }})
        .then(function(err) {
            if (err) {
                console.log(err);
            }
            res.send("note deleted")
        })
    }
    })
})


app.listen(PORT, function() {
    console.log(`LISTENING ON PORT: ${PORT}`);
})