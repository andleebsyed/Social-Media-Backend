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

    const ourUser = await User.findOne({ _id: userId })
      .populate("posts")
      .populate("likedPosts");
    const { posts, likedPosts, username, name } = ourUser;

    const orderedPosts = posts.sort((a, b) => b.timestamp - a.timestamp);

    const updatedPosts = orderedPosts.map((post) =>
      likedPosts?.find((likedPost) => post._id.equals(likedPost._id))
        ? { ...post._doc, liked: true }
        : { ...post._doc, liked: false }
    );
    const userData = { username, name, updatedPosts };
    res.json({
      status: true,
      message: "posts fetched successfully",
      userData,
      // ourUser,
      // currentPosts,
    });
  } catch (err) {
    console.log(err, err.message);
    res.json({
      status: false,
      message: "error occurred",
      errorDetail: err.message,
    });
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
    let user = await User.findOne({ _id: userId });
    let post = await Post.findOne({ _id: postId });
    if (action === "inc") {
      post.likedBy.push(userId);
      user.likedPosts.push(postId);
      const { likedBy } = await post.save();
      const { likedPosts } = await user.save();
      res.json({
        status: true,
        message: "liked post successfully",
        likedBy,
        likedPosts,
      });
    } else {
      console.log("coming here or not");
      const updatedPosts = user.likedPosts.filter((id) => !id.equals(postId));
      const updatedUsers = post.likedBy.filter((id) => !id.equals(userId));
      user.likedPosts = updatedPosts;
      post.likedBy = updatedUsers;
      console.log({ user });
      console.log({ post });
      const { likedBy } = await post.save();
      const { likedPosts } = await user.save();
      res.json({
        status: true,
        message: "unliked post successfully",
        likedBy,
        likedPosts,
      });
    }
  } catch (error) {
    res.json({
      status: false,
      message: "likes were not updated",
      errorDetail: error.message,
    });
  }
};
module.exports = { FetchAllPosts, CreatePost, LikeInteraction };
