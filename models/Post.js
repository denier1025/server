const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create Schema
const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  title: {
    type: String,
    requires: true,
    min: 16,
    max: 256
  },
  text: {
    type: String,
    requires: true,
    min: 256,
    max: 2500
  },
  images: {
    type: [
      {
        image: {
          type: Buffer,
          required: true
        },
        contentType: {
          type: String,
          required: true
        }
      }
    ]
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
  comments: {
    type: [
      {
        user: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "User"
        },
        text: {
          type: String,
          required: true,
          min: 16,
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
        }
      }
    ]
  },
  from: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Post", PostSchema);
