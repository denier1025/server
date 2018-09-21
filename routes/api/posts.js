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
// @access Private
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
      errors.internalServerError = `Internal server error: ${err.name} ${
        err.message
      }`;
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
      res.json(post);
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
        errors.internalServerError = `Internal server error: ${err.name} ${
          err.message
        }`;
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
          })
            .save()
            .then(() => {
              //Delete post
              post.remove().then(() => {
                res.json({ success: true });
              });
            });
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

// @route  POST api/posts/:postId/like
// @desc   Like post
// @access Private
router.post(
  "/:postId/like",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Post.findById(req.params.postId)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id).length
        ) {
          errors.like = "You already liked this post";
          res.status(400).json(errors);
        } else {
          if (
            post.dislikes.filter(
              dislike => dislike.user.toString() === req.user.id
            ).length
          ) {
            //Get remove index
            const removeIndex = post.dislikes
              .map(item => item.user.toString())
              .indexOf(req.user.id);
            //Splice out of array
            post.dislikes.splice(removeIndex, 1);
          }
          //Add user id to likes array
          post.likes.unshift({ user: req.user.id });

          Post.findByIdAndUpdate(
            req.params.postId,
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

// @route  POST api/posts/:postId/dislike
// @desc   Dislike post
// @access Private
router.post(
  "/:postId/dislike",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Post.findById(req.params.postId)
      .then(post => {
        if (
          post.dislikes.filter(
            dislike => dislike.user.toString() === req.user.id
          ).length
        ) {
          errors.dislike = "You is already desliked this post";
          res.status(400).json(errors);
        } else {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length
          ) {
            //Get remove index
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);
            //Splice out of array
            post.likes.splice(removeIndex, 1);
          }
          //Add user id to dislikes array
          post.dislikes.unshift({ user: req.user.id });

          Post.findByIdAndUpdate(
            req.params.postId,
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
        // Add new comment to array
        post.comments.unshift({
          user: req.user.id,
          text: req.body.text
        });
        Post.findByIdAndUpdate(
          req.params.postId,
          {
            $set: {
              comments: post.comments
            }
          },
          { new: true }
        ).then(post => {
          res.json(post);
        });
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
          })
            .save()
            .then(() => {
              //Splice comment out of array
              post.comments.splice(removeIndex, 1);

              Post.findByIdAndUpdate(
                req.params.postId,
                {
                  $set: {
                    comments: post.comments
                  }
                },
                { new: true }
              ).then(post => {
                res.json(post);
              });
            });
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

// @route  GET api/posts/:postId/comments
// @desc   Get all comments of the selected post
// @access Private
router.get(
  "/:postId/comments",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Post.findById(req.params.postId)
      .then(post => {
        res.json(post.comments);
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

// @route  GET api/posts/:postId/comments/:commentId
// @desc   Get a comment by commentId
// @access Public
router.get("/:postId/comments/:commentId", (req, res) => {
  const errors = {};
  Post.findById(req.params.postId)
    .then(post => {
      const filteredComments = post.comments.filter(
        comment => comment.id.toString() === req.params.commentId
      );
      //Check to see if comment exists
      if (!filteredComments[0]) {
        errors.comment = "Comment does not exists";
        res.status(404).json(errors);
      } else {
        res.json(filteredComments[0]);
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

// @route  POST api/posts/:postId/comments/:commentId/like
// @desc   Like comment
// @access Private
router.post(
  "/:postId/comments/:commentId/like",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Post.findById(req.params.postId)
      .then(post => {
        const filteredComments = post.comments.filter(
          comment => comment.id.toString() === req.params.commentId
        );
        //Check to see if comment exists
        if (!filteredComments[0]) {
          errors.comment = "Comment does not exists";
          res.status(404).json(errors);
        } else {
        if (
          filteredComments[0].likes.filter(like => like.user.toString() === req.user.id).length
        ) {
          errors.like = "You already liked this post";
          res.status(400).json(errors);
        } else {
          if (
            filteredComments[0].dislikes.filter(
              dislike => dislike.user.toString() === req.user.id
            ).length
          ) {
            //Get remove index
            const removeIndex = filteredComments[0].dislikes
              .map(item => item.user.toString())
              .indexOf(req.user.id);
            //Splice out of array
            filteredComments[0].dislikes.splice(removeIndex, 1);
          }
          //Add user id to likes array
          filteredComments[0].likes.unshift({ user: req.user.id });

          Post.findByIdAndUpdate(
            req.params.postId,
            {
              $set: {comments: post.comments}
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

// @route  POST api/posts/:postId/comments/:commentId/dislike
// @desc   Dislike comment
// @access Private
router.post(
  "/:postId/comments/:commentId/dislike",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Post.findById(req.params.postId)
      .then(post => {
        const filteredComments = post.comments.filter(
          comment => comment.id.toString() === req.params.commentId
        );
        //Check to see if comment exists
        if (!filteredComments[0]) {
          errors.comment = "Comment does not exists";
          res.status(404).json(errors);
        } else {
        if (
          filteredComments[0].dislikes.filter(dislike => dislike.user.toString() === req.user.id).length
        ) {
          errors.dislike = "You already disliked this post";
          res.status(400).json(errors);
        } else {
          if (
            filteredComments[0].likes.filter(
              like => like.user.toString() === req.user.id
            ).length
          ) {
            //Get remove index
            const removeIndex = filteredComments[0].likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);
            //Splice out of array
            filteredComments[0].likes.splice(removeIndex, 1);
          }
          //Add user id to likes array
          filteredComments[0].dislikes.unshift({ user: req.user.id });

          Post.findByIdAndUpdate(
            req.params.postId,
            {
              $set: {comments: post.comments}
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
