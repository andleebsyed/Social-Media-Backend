const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const PostSchema = Schema({
  postImage: {
    type: String,
  },
  postText: {
    type: String,
    required: true,
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
});

const Post = model("Post", PostSchema);

module.exports = { Post };
