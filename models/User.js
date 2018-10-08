const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Avatar = new Schema({
  image: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  from: {
    type: Date,
    default: Date.now
  }
});

const Permission = new Schema({
  status: {
    type: String,
    default: "newbie",
    min: 2,
    max: 50
  },
  from: {
    type: Date,
    default: Date.now
  },
  by: {
    type: String,
    required: true
  }
});

const Frozen = new Schema({
  from: {
    type: Date,
    default: Date.now
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
    required: true,
    min: 3,
    max: 256
  }
});

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    min: 3,
    max: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    min: 6,
    max: 50
  },
  password: {
    type: String,
    required: true,
    trim: true,
    min: 6,
    max: 50
  },
  avatar: {
    type: Avatar
  },
  permission: {
    type: Permission,
    default: {
      by: "auto"
    }
  },
  frozen: {
    type: Frozen
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);
