const router = require("express").Router();
const News = require("mongoose").model("News");
const NewsHistory = require("mongoose").model("NewsHistory");
const passport = require("passport");

const validateNewsInput = require("../validation/news");
const isEmpty = require("../validation/isEmpty");

// @route  GET api/news
// @desc   Get news
// @access Public
router.get("/", (req, res) => {
  const errors = {};
  News.find()
    .then(news => {
      if (isEmpty(news)) {
        errors.news = "No news found";
        res.status(404).json(errors);
      } else {
        res.json(news);
      }
    })
    .catch(err => {
      errors.internalServerError = "Internal server error";
      res.status(500).json(errors);
    });
});

// @route  GET api/news/:id
// @desc   Get news
// @access Public
router.get("/:id", (req, res) => {
  const errors = {};
  News.findById(req.params.id)
    .then(news => {
      if (isEmpty(news)) {
        errors.news = "No news found with that id";
        res.status(404).json(errors);
      } else {
        res.json(news);
      }
    })
    .catch(err => {
      if (err.name === "CastError") {
        errors.news = "No news found with that id";
        res.status(404).json(errors);
      } else {
        errors.internalServerError = "Internal server error";
        res.status(500).json(errors);
      }
    });
});

// @route  POST api/news
// @desc   Create news
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateNewsInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newNews = new News({
      user: req.user.id,
      title: req.body.title,
      subtitle: req.body.subtitle,
      text: req.body.text,
      tags: req.body.tags
    });

    newNews
      .save()
      .then(news => res.json(news))
      .catch(err => {
        errors.internalServerError = "Internal server error";
        res.status(500).json(errors);
      });
  }
);

// @route  DELETE api/news/:id
// @desc   Delete news
// @access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    News.findById(req.params.id)
      .then(news => {
        if (isEmpty(news)) {
          errors.news = "No news found with that id";
          res.status(404).json(errors);
        } else {
          if (news.user.toString() !== req.user.id) {
            //TODO: @Perm
            errors.permission = "You don't have enough permissions";
            res.status(403).json(errors);
          } else {
            new NewsHistory({
              by: req.user.id,
              news: {
                user: news.user,
                title: news.title,
                subtitle: news.subtitle,
                text: news.text,
                tags: news.tags,
                likes: news.likes,
                dislikes: news.dislikes,
                from: news.from
              }
            })
              .save()
              .then(() => {
                news.remove().then(() => {
                  res.json({ success: true });
                });
              });
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.news = "No news found with that id";
          res.status(404).json(errors);
        } else {
          errors.internalServerError = "Internal server error";
          res.status(500).json(errors);
        }
      });
  }
);

// @route  POST api/news/:id/like
// @desc   Like news
// @access Private
router.post(
  "/:id/like",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    News.findById(req.params.id)
      .then(news => {
        if (isEmpty(news)) {
          errors.news = "No news found with that id";
          res.status(404).json(errors);
        } else {
          if (
            news.likes.filter(like => like.user.toString() === req.user.id)
              .length
          ) {
            errors.like = "You already liked this news";
            res.status(400).json(errors);
          } else {
            if (
              news.dislikes.filter(
                dislike => dislike.user.toString() === req.user.id
              ).length
            ) {
              const removeIndex = news.dislikes
                .map(item => item.user.toString())
                .indexOf(req.user.id);
              news.dislikes.splice(removeIndex, 1);
            }

            news.likes.unshift({ user: req.user.id });

            News.findByIdAndUpdate(
              req.params.id,
              {
                $set: {
                  likes: news.likes,
                  dislikes: news.dislikes
                }
              },
              { new: true }
            ).then(news => {
              res.json(news);
            });
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.news = "No news found with that id";
          res.status(404).json(errors);
        } else {
          errors.internalServerError = "Internal server error";
          res.status(500).json(errors);
        }
      });
  }
);

// @route  POST api/news/:id/dislike
// @desc   Dislike news
// @access Private
router.post(
  "/:id/dislike",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    News.findById(req.params.id)
      .then(news => {
        if (isEmpty(news)) {
          errors.news = "No news found with that id";
          res.status(404).json(errors);
        } else {
          if (
            news.dislikes.filter(
              dislike => dislike.user.toString() === req.user.id
            ).length
          ) {
            errors.dislike = "You already desliked this news";
            res.status(400).json(errors);
          } else {
            if (
              news.likes.filter(like => like.user.toString() === req.user.id)
                .length
            ) {
              const removeIndex = news.likes
                .map(item => item.user.toString())
                .indexOf(req.user.id);
              news.likes.splice(removeIndex, 1);
            }

            news.dislikes.unshift({ user: req.user.id });

            News.findByIdAndUpdate(
              req.params.id,
              {
                $set: {
                  likes: news.likes,
                  dislikes: news.dislikes
                }
              },
              { new: true }
            ).then(news => {
              res.json(news);
            });
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.news = "No news found with that id";
          res.status(404).json(errors);
        } else {
          errors.internalServerError = "Internal server error";
          res.status(500).json(errors);
        }
      });
  }
);

module.exports = router;
