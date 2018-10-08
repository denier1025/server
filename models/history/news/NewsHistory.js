const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const News = new Schema({
  user: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    required: true
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

const NewsHistorySchema = new Schema({
  by: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  News: {
    type: News,
    required: true
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("NewsHistory", NewsHistorySchema);
