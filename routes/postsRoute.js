const express = require("express");
const { CreatePost, FetchAllPosts } = require("../controllers/posts");
const postsRoute = express.Router();

postsRoute.post("/upload", CreatePost);
postsRoute.post("/read", FetchAllPosts);

module.exports = { postsRoute };
