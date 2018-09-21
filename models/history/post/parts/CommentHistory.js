const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Comment = new Schema({
  user: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  likes: {
    type: [
      {
        user: {
          type: String,
          required: true
        },
        from: {
          type: Date,
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

const CommentHistorySchema = new Schema({
  by: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  comment: {
    type: Comment,
    required: true
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("CommentHistory", CommentHistorySchema);
