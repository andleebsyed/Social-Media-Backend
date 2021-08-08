const express = require("express");
const { CreatePost, ReadPosts } = require("../controllers/posts");
const postsRoute = express.Router();

postsRoute.post("/upload", CreatePost);
postsRoute.post("/read", ReadPosts);

module.exports = { postsRoute };
