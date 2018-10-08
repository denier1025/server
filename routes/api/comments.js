const router = require("express").Router();
const Comment = require("mongoose").model("Comment");
const CommentHistory = require("mongoose").model("CommentHistory");
const passport = require("passport");

const validateCommentInput = require("../validation/comment");
const isEmpty = require("../validation/isEmpty");

// @route  POST api/posts/:id/comments
// @desc   Add comment
// @access Private
router.post(
  ["/posts/:id/comments"],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCommentInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newComment = new Comment();
    newComment.user = req.user.id;
    newComment.text = req.body.text;

    if (req.path.split("/")[1] === "posts") {
      newComment.post = req.params.id;
    }

    newComment
      .save()
      .then(comment => res.json(comment))
      .catch(err => {
        errors.internalServerError = `Internal server error: ${err.name} ${
          err.message
        }`;
        res.status(500).json(errors);
      });
  }
);

// @route  DELETE api/comments/:id
// @desc   Remove comment
// @access Private
router.delete(
  "/comments/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Comment.findById(req.params.id)
      .then(comment => {
        if (isEmpty(comment)) {
          errors.comment = "No comment found with that id";
          res.status(404).json(errors);
        } else {
          if (comment.user.toString() !== req.user.id) {
            //TODO: @Perm
            errors.permission = "You don't have enough permissions";
            res.status(403).json(errors);
          } else {
            new CommentHistory({
              by: req.user.id,
              comment: {
                user: comment.user,
                post: comment.post,
                comment: comment.comment,
                text: comment.text,
                likes: comment.likes,
                dislikes: comment.dislikes,
                from: comment.from
              }
            })
              .save()
              .then(() => {
                comment.remove().then(() => {
                  res.json({ success: true });
                });
              });
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.comment = "No comment found with that id";
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

// @route  GET api/post/:id/comments
// @desc   Get all comments
// @access Private
router.get(
  ["/posts/:id/comments"],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    const opts = {};
    if (req.path.split("/")[1] === "posts") {
      opts.post = req.params.id;
    } else {
      errors.path = "Path not found";
      return res.status(404).json(errors);
    }
    Comment.find(opts)
      .then(comments => {
        res.json(comments);
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

// @route  GET api/comments/:id
// @desc   Get comment
// @access Public
router.get("/comments/:id", (req, res) => {
  const errors = {};
  Comment.findById(req.params.id)
    .then(comment => {
      if (isEmpty(comment)) {
        errors.comment = "No comment found with that id";
        res.status(404).json(errors);
      } else {
        res.json(comment);
      }
    })
    .catch(err => {
      if (err.name === "CastError") {
        errors.post = "No comment found with that id";
        res.status(404).json(errors);
      } else {
        errors.internalServerError = `Internal server error: ${err.name} ${
          err.message
        }`;
        res.status(500).json(errors);
      }
    });
});

// @route  POST api/comments/:id/like
// @desc   Like comment
// @access Private
router.post(
  "/comments/:id/like",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Comment.findById(req.params.id)
      .then(comment => {
        if (isEmpty(comment)) {
          errors.comment = "No comment found with that id";
          res.status(404).json(errors);
        } else {
          if (
            comment.likes.filter(like => like.user.toString() === req.user.id)
              .length
          ) {
            errors.like = "You already liked this comment";
            res.status(400).json(errors);
          } else {
            if (
              comment.dislikes.filter(
                dislike => dislike.user.toString() === req.user.id
              ).length
            ) {
              const removeIndex = comment.dislikes
                .map(item => item.user.toString())
                .indexOf(req.user.id);
              comment.dislikes.splice(removeIndex, 1);
            }

            comment.likes.unshift({ user: req.user.id });

            Comment.findByIdAndUpdate(
              req.params.id,
              {
                $set: {
                  likes: comment.likes,
                  dislikes: comment.dislikes
                }
              },
              { new: true }
            ).then(comment => {
              res.json(comment);
            });
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.comment = "No comment found with that id";
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

// @route  POST api/comments/:id/dislike
// @desc   Dislike comment
// @access Private
router.post(
  "/comments/:id/dislike",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Comment.findById(req.params.id)
      .then(comment => {
        if (isEmpty(comment)) {
          errors.comment = "No comment found with that id";
          res.status(404).json(errors);
        } else {
          if (
            comment.dislikes.filter(
              dislike => dislike.user.toString() === req.user.id
            ).length
          ) {
            errors.dislike = "You already disliked this comment";
            res.status(400).json(errors);
          } else {
            if (
              comment.likes.filter(like => like.user.toString() === req.user.id)
                .length
            ) {
              const removeIndex = comment.likes
                .map(item => item.user.toString())
                .indexOf(req.user.id);
              comment.likes.splice(removeIndex, 1);
            }

            comment.dislikes.unshift({ user: req.user.id });

            Comment.findByIdAndUpdate(
              req.params.id,
              {
                $set: {
                  likes: comment.likes,
                  dislikes: comment.dislikes
                }
              },
              { new: true }
            ).then(comment => {
              res.json(comment);
            });
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.comment = "No comment found with that id";
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
