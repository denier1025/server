const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateNewsInput(data) {
  const errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.subtitle = !isEmpty(data.subtitle) ? data.subtitle : "";
  data.text = !isEmpty(data.text) ? data.text : "";
  data.tags = !isEmpty(data.tags) ? data.tags : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title field is required";
  } else if(!Validator.isLength(data.title, { min: 16, max: 128 })) {
    errors.title = "Title must be between 16 and 128 characters";
  }

  if (Validator.isEmpty(data.subtitle)) {
    errors.subtitle = "Subtitle field is required";
  } else if(!Validator.isLength(data.subtitle, { min: 64, max: 512 })) {
    errors.subtitle = "Subtitle must be between 64 and 512 characters";
  }

  if (Validator.isEmpty(data.text)) {
    errors.text = "Text field is required";
  } else if(!Validator.isLength(data.text, { min: 1500, max: 3500 })) {
    errors.text = "Text must be between 1500 and 3500 characters";
  }

  if (Validator.isEmpty(data.tags)) {
    errors.tags = "Tags field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};