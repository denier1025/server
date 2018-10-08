const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post"
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  },
  text: {
    type: String,
    requires: true,
    min: 8,
    max: 256
  },
  likes: {
    type: [
      {
        user: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "User"
        }
      }
    ]
  },
  dislikes: {
    type: [
      {
        user: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "User"
        }
      }
    ]
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Comment", CommentSchema);
