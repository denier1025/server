const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Post = new Schema({
  user: {
    type: String,
    required: true
  },
  title: {
    type: String,
    requires: true
  },
  text: {
    type: String,
    requires: true
  },
  likes: {
    type: [
      {
        user: {
          type: String,
          required: true
        }
      }
    ]
  },
  dislikes: {
    type: [
      {
        user: {
          type: String,
          required: true
        }
      }
    ]
  },
  from: {
    type: Date,
    required: true
  }
});

const PostHistorySchema = new Schema({
  by: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  post: {
    type: Post,
    required: true
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("PostHistory", PostHistorySchema);
