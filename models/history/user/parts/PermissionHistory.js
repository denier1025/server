const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Permission = new Schema({
  user: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  by: {
    type: String,
    required: true
  },
  from: {
    type: Date,
    required: true
  }
});

const PermissionHistorySchema = new Schema({
  by: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  permission: {
    type: Permission,
    required: true
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("PermissionHistory", PermissionHistorySchema);
