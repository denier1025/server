const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateImageInput(data) {
  const errors = {};

  // Validation process

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
