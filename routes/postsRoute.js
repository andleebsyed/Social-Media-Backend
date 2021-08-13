const express = require("express");
const {
  CreatePost,
  FetchAllPosts,
  LikeInteraction,
} = require("../controllers/posts");
const postsRoute = express.Router();

postsRoute.post("/upload", CreatePost);
postsRoute.post("/read", FetchAllPosts);
postsRoute.post("/likeinteraction", LikeInteraction);

module.exports = { postsRoute };
