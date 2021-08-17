const express = require("express");
const {
  CreatePost,
  FetchAllPosts,
  LikeInteraction,
  CommentPost,
  RemoveComment,
  FetchComments,
} = require("../controllers/posts");
const postsRoute = express.Router();

postsRoute.post("/upload", CreatePost);
postsRoute.post("/read", FetchAllPosts);
postsRoute.post("/likeinteraction", LikeInteraction);
postsRoute.post("/addcomment", CommentPost);
postsRoute.post("/removecomment", RemoveComment);
postsRoute.post("/fetchcomments", FetchComments);

module.exports = { postsRoute };
