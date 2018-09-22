const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const User = require("mongoose").model("User");

// Validator
const validateRegisterInput = require("../validation/register");

// @route  GET api/register
// @desc   Register user
// @access Public
router.post("/", (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
  
    // Check validation result
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    User.findOne({ email: req.body.email })
      .then(user => {
        if (user) {
          errors.email = "Email already exists";
          res.status(400).json(errors);
        } else {
          User.findOne({ username: req.body.username }).then(user => {
            if (user) {
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
                  newUser.save().then(user => {
                    res.json({
                      id: user.id,
                      username: user.username,
                      email: user.email,
                      avatar: user.avatar,
                      status: user.permission.status
                    });
                  });
                });
              });
            }
          });
        }
      })
      .catch(err => {
        errors.internalServerError = `Internal server error: ${err.name} ${
          err.message
        }`;
        res.status(500).json(errors);
      });
  });

module.exports = router;
