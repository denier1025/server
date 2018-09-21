const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Password = new Schema({
  user: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  from: {
    type: Date,
    required: true
  }
});

const PasswordHistorySchema = new Schema({
  by: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  password: {
    type: Password,
    required: true
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("PasswordHistory", PasswordHistorySchema);
