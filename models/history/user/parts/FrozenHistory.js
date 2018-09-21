const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Frozen = new Schema({
  user: {
    type: String,
    required: true
  },
  from: {
    type: Date,
    required: true
  },
  to: {
    type: Date,
    required: true
  },
  by: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const FrozenHistorySchema = new Schema({
  by: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  frozen: {
    type: Frozen,
    required: true
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("FrozenHistory", FrozenHistorySchema);
