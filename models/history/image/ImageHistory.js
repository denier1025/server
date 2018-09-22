const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Image = new Schema({
  user: {
    type: String,
    required: true
  },
  post: {
    type: String
  },
  comment: {
    type: String
  },
  image: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
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

const ImageHistorySchema = new Schema({
  by: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  post: {
    type: Image,
    required: true
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ImageHistory", ImageHistorySchema);
