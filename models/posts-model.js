const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const PostSchema = Schema({
  postImage: {
    type: String,
    required: true,
  },
  postText: {
    type: String,
    required: true,
  },
});

const Posts = model("Post", PostSchema);

module.exports = { Posts };
