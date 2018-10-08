const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const FrozenHistory = mongoose.model("FrozenHistory");
const keys = require("../../config/keys");
const isEmpty = require("../validation/isEmpty");

const validateLoginInput = require("../validation/login");

// @route  POST api/login
// @desc   Login User / Returning JWT Token
// @access Public
router.post("/", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (isEmpty(user)) {
        errors.email = "User not found";
        res.status(404).json(errors);
      } else {
        bcryptjs.compare(req.body.password, user.password).then(isMatch => {
          if (isMatch) {
            if (user.frozen) {
              if (!(user.frozen.to < Date.now())) {
                errors.frozen = {
                  message: "Your account is frozen",
                  from: user.frozen.from,
                  to: user.frozen.to,
                  description: user.frozen.description
                };
                res.status(403).json(errors);
              } else {
                new FrozenHistory({
                  by: user.id,
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
                    User.update(
                      { _id: user.id },
                      {
                        $set: {
                          frozen: null
                        }
                      },
                      { new: true }
                    );
                  });
              }
            }
            const payload = {
              id: user.id,
              username: user.username,
              avatar: user.avatar
            };
            jwt.sign(
              payload,
              keys.jwtSecretOrKey,
              { expiresIn: 1 * 60 },
              (err, token) => {
                res.json({
                  token: "Bearer " + token
                });
              }
            );
          } else {
            errors.password = "Password incorrect";
            res.status(400).json(errors);
          }
        });
      }
    })
    .catch(err => { //TODO: logger
      errors.internalServerError = "Internal server error";
      res.status(500).json(errors);
    });
});

module.exports = router;
