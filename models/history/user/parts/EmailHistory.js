const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Email = new Schema({
  user: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  from: {
    type: Date,
    required: true
  }
});

const EmailHistorySchema = new Schema({
  by: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  email: {
    type: Email,
    required: true
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("EmailHistory", EmailHistorySchema);
