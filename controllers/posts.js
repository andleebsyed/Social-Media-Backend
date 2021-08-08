const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const { Posts } = require("../models/posts-model");
async function ReadPosts() {}

const CreatePost = async (req, res) => {
  const fileData = req.files.photo;
  const postText = req.body.text;
  if (fileData) {
    await cloudinary.uploader.upload(
      fileData.tempFilePath,
      async (err, result) => {
        if (err) {
          console.log("Error occurred while uploading file");
          res.status(500).json({
            status: false,
            message: "image uploaddation to cloudinary failed",
            errorDetail: err,
          });
        } else {
          const imageLink = result.secure_url;
          const postContent = {
            postText,
            postImage: imageLink,
          };
          const newPost = new Posts(postContent);
          const savedPost = await newPost.save();
          res.json({
            status: true,
            message: "post saved successfully",
            savedPost,
          });
        }
      }
    );
  } else {
    res.json({ status: false, message: "file not available" });
  }
};

module.exports = { ReadPosts, CreatePost };
