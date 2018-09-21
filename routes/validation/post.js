const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validatePostInput(data) {
  const errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.text = !isEmpty(data.text) ? data.text : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title field is required";
  } else if(!Validator.isLength(data.title, { min: 16, max: 256 })) {
    errors.title = "Title must be between 16 and 256 characters";
  }

  if (Validator.isEmpty(data.text)) {
    errors.text = "Text field is required";
  } else if(!Validator.isLength(data.text, { min: 256, max: 2500 })) {
    errors.text = "Text must be between 256 and 2500 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
