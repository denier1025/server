const router = require("express").Router();
const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const FrozenHistory = mongoose.model("FrozenHistory");

// @route  GET api/users/current
// @desc   Return current user
// @access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) =>
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
      status: req.user.permission.status
    })
);

// @route  Freeze api/users/:userId
// @desc   Freeze user
// @access Private
router.post(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};

    if (req.user.id === req.params.userId) {
      errors.frozen = "Freeze yourself not allowed";
      return res.status(403).json(errors);
    }

    User.findById(req.params.userId)
      .then(user => {
        const updateUser = () => {
          User.findByIdAndUpdate(
            req.params.userId,
            {
              $set: {
                frozen: {
                  to: Date.now() + Number(req.body.to),
                  by: req.user.id,
                  description: req.body.description
                }
              }
            },
            { new: true }
          ).then(user => {
            res.json(user);
          });
        };
        if (user.frozen) {
          if (user.frozen.to < Date.now()) {
            new FrozenHistory({
              by: req.user.id,
              frozen: {
                user: user.id.toString(),
                from: user.frozen.from,
                to: user.frozen.to,
                by: user.frozen.by,
                description: user.frozen.description
              }
            })
              .save()
              .then(() => {
                updateUser();
              });
          }
        }
        updateUser();
      })
      .catch(err => {
        if (err.name === "CastError") {
          errors.user = "No user with that id";
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

// @route  GET api/users
// @desc   Get all users
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    User.find()
      .then(users => {
        res.json(users);
      })
      .catch(err => {
        errors.internalServerError = `Internal server error: ${err.name} ${
          err.message
        }`;
        res.status(500).json(errors);
      });
  }
);

// @route  GET api/users/current/logout
// @desc   Logout current user
// @access Private

module.exports = router;
