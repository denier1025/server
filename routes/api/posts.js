const router = require("express").Router();
const Post = require("mongoose").model("Post");
const PostHistory = require("mongoose").model("PostHistory");
const CommentHistory = require("mongoose").model("CommentHistory");
const passport = require("passport");

// Validators
const validatePostInput = require("../validation/post");
const validateCommentInput = require("../validation/comment");

// @route  GET api/posts
// @desc   Get posts
// @access Public
router.get("/", (req, res) => {
  const errors = {};
  Post.find()
    .sort({ from: -1 })
    .then(posts => {
      if (!posts.length) {
        errors.posts = "No posts found";
        res.status(404).json(errors);
      } else {
        res.json(posts);
      }
    })
    .catch(err => {
      errors.internalServerError = "Internal server error";
      res.status(500).json(errors);
    });
});

// @route  GET api/posts/:postId
// @desc   Get post by id
// @access Public
router.get("/:postId", (req, res) => {
  const errors = {};
  Post.findById(req.params.postId)
    .then(post => {
      if (!post) {
        errors.post = "No post found with that id";
        res.status(404).json(errors);
      } else {
        res.json(post);
      }
    })
    .catch(err => {
      if (err.name === "CastError") {
        errors.nopostfound = "No post found with that id";
        res.status(404).json(errors);
      } else {
        errors.internalServerError = "Internal server error";
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

    // Check validation result
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      user: req.user.id,
      title: req.body.title,
      text: req.body.text,
      images: req.body.images
    });

    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => {
        errors.internalServerError = "Internal server error";
        res.status(500).json(errors);
      });
  }
);

// @route  DELETE api/posts/:postId
// @desc   Delete post
// @access Private
router.delete(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Post.findById(req.params.postId)
      .then(post => {
        if (!post) {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          if (post.user.toString() !== req.user.id) {
            errors.permission = "You don't have enough permission";
            res.status(403).json(errors);
          } else {
            // Move post to PostHistory
            new PostHistory({
              by: req.user.id,
              post: {
                user: post.user,
                title: post.title,
                text: post.text,
                images: post.images,
                likes: post.likes,
                comments: post.comments,
                from: post.from
              }
            }).save().then(() => {
              //Delete post
            post.remove().then(() => {
              res.json({ success: true });
            });
            })
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          errors.internalServerError = "Internal server error";
          res.status(500).json(errors);
        }
      });
  }
);

// Checked
// @route  POST api/posts/like/:id
// @desc   Like post
// @access Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Post.findById(req.params.id)
      .then(post => {
        if (!post) {
          errors.nopostfound = "No post found with that ID";
          res.status(404).json(errors);
        } else {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length
          ) {
            errors.alreadyliked = "User already liked this post";
            res.status(400).json(errors);
          } else {
            //Add user id to likes array
            post.likes.unshift({ user: req.user.id });
            post.save().then(post => res.json(post));
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.nopostfound = "No post found with that ID";
          res.status(404).json(errors);
        } else {
          errors.internalServerError = "Internal server error";
          res.status(500).json(errors);
        }
      });
  }
);

// Checked
// @route  POST api/posts/unlike/:id
// @desc   Like post
// @access Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Post.findById(req.params.id)
      .then(post => {
        if (!post) {
          errors.nopostfound = "No post found with that ID";
          res.status(404).json(errors);
        } else {
          if (
            !post.likes.filter(like => like.user.toString() === req.user.id)
              .length
          ) {
            errors.notliked = "User have not yet liked this post";
            res.status(400).json(errors);
          } else {
            //Get remove index
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);
            //Splice out of array
            post.likes.splice(removeIndex, 1);
            //Save
            post.save().then(post => res.json(post));
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.nopostfound = "No post found with that ID";
          res.status(404).json(errors);
        } else {
          errors.internalServerError = "Internal server error";
          res.status(500).json(errors);
        }
      });
  }
);

// @route  POST api/posts/:postId/comments
// @desc   Add comment to post
// @access Private
router.post(
  "/:postId/comments",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCommentInput(req.body);

    //Check validation result
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.postId)
      .then(post => {
        if (!post) {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          const newComment = {
            user: req.user.id,
            text: req.body.text
          };
          //Add to comments array
          post.comments.unshift(newComment);
          //Save
          post.save().then(post => res.json(post));
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          errors.internalServerError = "Internal server error";
          res.status(500).json(errors);
        }
      });
  }
);

// @route  DELETE api/posts/:postId/comments/:commentId
// @desc   Remove comment from post
// @access Private
router.delete(
  "/:postId/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Post.findById(req.params.postId)
      .then(post => {
        if (!post) {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          const filteredComments = post.comments.filter(
            comment => comment.id.toString() === req.params.commentId
          );
          //Check to see if comment exists
          if (!filteredComments[0]) {
            errors.comment = "Comment does not exists";
            res.status(404).json(errors);
          } else if (filteredComments[0].user.toString() !== req.user.id) {
            errors.permission = "You don't have enough permission";
            res.status(403).json(errors);
          } else {
            //Get remove index
            const removeIndex = post.comments
              .map(item => item.id.toString())
              .indexOf(req.params.commentId);
            // Move comment to CommentHistory
            new CommentHistory({
              by: req.user.id,
              comment: {
                user: post.comments[removeIndex].user,
                text: post.comments[removeIndex].text,
                likes: post.comments[removeIndex].likes,
                from: post.comments[removeIndex].from
              }
            }).save().then(() => {
              //Splice comment out of array
              post.comments.splice(removeIndex, 1);
              post.save().then(post => res.json(post));
            })
          }
        }
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.post = "No post found with that id";
          res.status(404).json(errors);
        } else {
          errors.internalServerError = "Internal server error";
          res.status(500).json(errors);
        }
      });
  }
);

// @route  GET api/posts/:postId/comments
// @desc   Get all comments of the selected post
// @access Public

// @route  GET api/posts/:postId/comments/:commentId
// @desc   Get a comment by commentId
// @access Public

module.exports = router;
