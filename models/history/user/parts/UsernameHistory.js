const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Username = new Schema({
  user: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  from: {
    type: Date,
    required: true
  }
});

const UsernameHistorySchema = new Schema({
  by: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  username: {
    type: Username,
    required: true
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("UsernameHistory", UsernameHistorySchema);
