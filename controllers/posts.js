const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const { Post } = require("../models/posts-model");
const { User } = require("../models/user-model");
async function FetchAllPosts(req, res) {
  try {
    const { userId } = req.body;
    const ourUser = await User.findOne({ _id: userId }).populate("posts");
    res.json({ status: true, message: "posts fetched successfully", ourUser });
  } catch (err) {
    console.log(err, err.message);
    res.json({ status: false, message: "error occurred", errorDetail: err });
  }
}

const CreatePost = async (req, res) => {
  try {
    console.log(req.files);
    const fileData = req?.files?.postImage;
    const postText = req.body?.postText;
    const { userId } = req.body;
    let postContent = {
      author: userId,
      postText,
      timestamp: new Date(),
      likes: 0,
    };
    if (fileData) {
      await cloudinary.uploader.upload(
        fileData.tempFilePath,
        async (err, result) => {
          if (err) {
            console.log("Error occurred while uploading file");
            res.status(500).json({
              status: false,
              message: "image uploadation to cloudinary failed",
              errorDetail: err,
            });
          } else {
            const imageLink = result.secure_url;
            postContent = {
              ...postContent,
              postImage: imageLink,
            };
          }
        }
      );
    }
    const newPost = new Post(postContent);
    const savedPost = await newPost.save();
    const ourUser = await User.findOne({ _id: userId });
    const updatedPosts = [...ourUser.posts, savedPost._id];
    await User.findOneAndUpdate({ _id: userId }, { posts: updatedPosts });
    res.json({
      status: true,
      message: "post saved successfully",
      savedPost,
    });
  } catch (err) {
    console.log(err, err.message);
    res.json({ status: false, message: "error occurred", errorDetail: error });
  }
};
const LikeInteraction = async (req, res) => {
  try {
    const { postId, action, userId } = req.body;
    let modifier = action === "inc" ? 1 : -1;
    // console.log({ action });
    // console.log(postId, userId);
    // console.log({ modifier });

    const post = await Post.findOneAndUpdate(
      { _id: postId },
      { $inc: { likes: modifier } },
      { new: true }
    );
    let user = await User.findOne({ _id: userId });
    if (action === "inc") {
      user.likedPosts.push(postId);
      const updatedUser = await user.save();
      res.json({
        status: true,
        message: "liked post successfully",
        post,
        updatedUser,
      });
    } else {
      console.log("csme to dec");
      const updatedLikedPosts = user.likedPosts.filter(
        (post) => toString(post._id) !== toString(postId)
      );
      console.log({ updatedLikedPosts });
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { likedPosts: updatedLikedPosts },
        { new: true }
      );
      res.json({
        status: true,
        message: "liked post successfully",
        post,
        updatedUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "likes were not updated",
      errorDetail: error.message,
    });
  }
};
module.exports = { FetchAllPosts, CreatePost, LikeInteraction };
