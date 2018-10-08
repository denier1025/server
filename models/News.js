const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NewsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  title: {
    type: String,
    required: true,
    min: 16,
    max: 128
  },
  subtitle: {
    type: String,
    required: true,
    min: 64,
    max: 512
  },
  text: {
    type: String,
    required: true,
    min: 1500,
    max: 3500
  },
  tags: {
    type: [String],
    required: true
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

module.exports = mongoose.model("News", NewsSchema);