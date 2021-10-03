const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const CommentSchema = new Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: String,
  },
  {
    timestamps: true,
  }
);
const PostSchema = Schema(
  {
    postImage: {
      type: String,
    },
    postText: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: Number,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    comments: [CommentSchema],
  },
  {
    timestamps: true,
  }
);

const Post = model("Post", PostSchema);

module.exports = { Post };
