const router = require("express").Router();
const Post = require("mongoose").model("Post");
const PostHistory = require("mongoose").model("PostHistory");
const passport = require("passport");

const validatePostInput = require("../validation/post");
const isEmpty = require("../validation/isEmpty");

// @route  GET api/posts
// @desc   Get posts
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Post.find()
      .then(posts => {
        if (isEmpty(posts)) {
          errors.posts = "No posts found";
          res.status(404).json(errors);
        } else {
          res.json(posts);
        }
      })
      .catch(err => {
        errors.internalServerError = `Internal server error: ${err.name} ${
          err.message
        }`;
        res.status(500).json(errors);
      });
  }
);

// @route  GET api/posts/:id
// @desc   Get post
// @access Public
router.get("/:id", (req, res) => {
  const errors = {};
  Post.findById(req.params.id)
    .then(post => {
      if (isEmpty(post)) {
        errors.post = "No post found with that id";
        res.status(404).json(errors);
      } else {
        res.json(post);
      }
    })
    .catch(err => {
      if (err.name === "CastError") {
        errors.post = "No post found with that id";
        res.status(404).json(errors);
      } else {
        errors.internalServerError = `Internal server error: ${err.name} ${
          err.message
        }`;
        res.status(500).json(errors);
      }
    });
});

// @route  POST api/posts
// @desc   Create post
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      user: req.user.id,
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags
    });

    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => {
        errors.internalServerError = `Internal server error: ${err.name} ${
          err.message
        }`;
        res.status(500).json(errors);
      });
  }
);

// @route  DELETE api/posts/:id
// @desc   Delete post
// @access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Post.findById(req.params.id)
      .then(post => {
        if (isEmpty(post)) {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          if (post.user.toString() !== req.user.id) {
            //TODO: @Perm
            errors.permission = "You don't have enough permissions";
            res.status(403).json(errors);
          } else {
            new PostHistory({
              by: req.user.id,
              post: {
                user: post.user,
                title: post.title,
                text: post.text,
                tags: post.tags,
                likes: post.likes,
                dislikes: post.dislikes,
                from: post.from
              }
            })
              .save()
              .then(() => {
                post.remove().then(() => {
                  res.json({ success: true });
                });
              });
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          errors.internalServerError = `Internal server error: ${err.name} ${
            err.message
          }`;
          res.status(500).json(errors);
        }
      });
  }
);

// @route  POST api/posts/:id/like
// @desc   Like post
// @access Private
router.post(
  "/:id/like",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Post.findById(req.params.id)
      .then(post => {
        if (isEmpty(post)) {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length
          ) {
            errors.like = "You already liked this post";
            res.status(400).json(errors);
          } else {
            if (
              post.dislikes.filter(
                dislike => dislike.user.toString() === req.user.id
              ).length
            ) {
              const removeIndex = post.dislikes
                .map(item => item.user.toString())
                .indexOf(req.user.id);
              post.dislikes.splice(removeIndex, 1);
            }

            post.likes.unshift({ user: req.user.id });

            Post.findByIdAndUpdate(
              req.params.id,
              {
                $set: {
                  likes: post.likes,
                  dislikes: post.dislikes
                }
              },
              { new: true }
            ).then(post => {
              res.json(post);
            });
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          errors.internalServerError = `Internal server error: ${err.name} ${
            err.message
          }`;
          res.status(500).json(errors);
        }
      });
  }
);

// @route  POST api/posts/:id/dislike
// @desc   Dislike post
// @access Private
router.post(
  "/:id/dislike",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Post.findById(req.params.id)
      .then(post => {
        if (isEmpty(post)) {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          if (
            post.dislikes.filter(
              dislike => dislike.user.toString() === req.user.id
            ).length
          ) {
            errors.dislike = "You already desliked this post";
            res.status(400).json(errors);
          } else {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length
            ) {
              const removeIndex = post.likes
                .map(item => item.user.toString())
                .indexOf(req.user.id);
              post.likes.splice(removeIndex, 1);
            }

            post.dislikes.unshift({ user: req.user.id });

            Post.findByIdAndUpdate(
              req.params.id,
              {
                $set: {
                  likes: post.likes,
                  dislikes: post.dislikes
                }
              },
              { new: true }
            ).then(post => {
              res.json(post);
            });
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          errors.internalServerError = `Internal server error: ${err.name} ${
            err.message
          }`;
          res.status(500).json(errors);
        }
      });
  }
);

module.exports = router;
