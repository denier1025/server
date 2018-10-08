const router = require("express").Router();
const Image = require("mongoose").model("Image");
const ImageHistory = require("mongoose").model("ImageHistory");
const passport = require("passport");

const validateImageInput = require("../validation/image");
const isEmpty = require("../validation/isEmpty");

// @route  POST api/posts/:id/images
// @desc   Add image
// @access Private

// @route  DELETE api/images/:id
// @desc   Remove image
// @access Private

// @route  GET api/post/:id/images
// @desc   Get all images
// @access Private

// @route  GET api/images/:id
// @desc   Get image
// @access Public

// @route  POST api/images/:id/like
// @desc   Like image
// @access Private

// @route  POST api/images/:id/dislike
// @desc   Dislike image
// @access Private

module.exports = router;
