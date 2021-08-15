const express = require("express");
const {
  CreatePost,
  FetchAllPosts,
  LikeInteraction,
  CommentPost,
  RemoveComment,
} = require("../controllers/posts");
const postsRoute = express.Router();

postsRoute.post("/upload", CreatePost);
postsRoute.post("/read", FetchAllPosts);
postsRoute.post("/likeinteraction", LikeInteraction);
postsRoute.post("/addcomment", CommentPost);
postsRoute.post("/removecomment", RemoveComment);

module.exports = { postsRoute };
