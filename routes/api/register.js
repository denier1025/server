const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const User = require("mongoose").model("User");
const isEmpty = require("../validation/isEmpty");

const validateRegisterInput = require("../validation/register");

// @route  GET api/register
// @desc   Register user
// @access Public
router.post("/", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (!isEmpty(user)) {
        errors.email = "Email already exists";
        res.status(400).json(errors);
      } else {
        User.findOne({ username: req.body.username }).then(user => {
          if (!isEmpty(user)) {
            errors.username = "Username already exists";
            res.status(400).json(errors);
          } else {
            const newUser = new User({
              username: req.body.username,
              email: req.body.email,
              password: req.body.password
            });

            bcryptjs.genSalt(10).then(salt => {
              bcryptjs.hash(newUser.password, salt).then(hash => {
                newUser.password = hash;
                newUser.save();
              });
            });
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
