const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateCommentInput(data) {
  const errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (Validator.isEmpty(data.text)) {
    errors.text = "Text field is required";
  } else if(!Validator.isLength(data.text, { min: 8, max: 256 })) {
    errors.text = "Text must be between 8 and 256 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};