const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const { Post } = require("../models/posts-model");
async function FetchAllPosts() {
  const { userId } = req.body;
  const user = Users.findOne({ _id: userId });
  const posts = Post.find({});
}

const CreatePost = async (req, res) => {
  console.log(req.files);
  const fileData = req.files.postImage;
  const postText = req.body.postText;
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
          const newPost = new Post(postContent);
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

module.exports = { FetchAllPosts, CreatePost };
