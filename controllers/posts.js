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
    const allPosts = await Post.find({}).populate({
      path: "comments",
      populate: {
        path: "author",
      },
    });
    const ourUser = await User.findOne({ _id: userId })
      .select("-__v -passowrd -email")
      .populate({
        path: "posts",
        populate: {
          path: "author comments.author",
        },
      })
      .populate({
        path: "likedPosts",
        populate: {
          path: "author",
        },
      })
      .populate({
        path: "following ",
        populate: {
          path: "posts",
          populate: {
            path: "author comments.author",
          },
        },
      });

    let { likedPosts, following, posts, username, name } = ourUser;
    let followingPosts = [];
    following.forEach((followingUser) =>
      followingUser.posts.forEach((post) => followingPosts.push(post))
    );
    posts = posts.concat(followingPosts);
    const orderedPosts = posts.sort((a, b) => b.timestamp - a.timestamp);
    const finalUserPosts = orderedPosts.map((post) =>
      likedPosts?.find((likedPost) => post._id.equals(likedPost._id))
        ? { ...post._doc, liked: true }
        : { ...post._doc, liked: false }
    );
    const userData = { username, name, finalUserPosts };
    res.json({
      status: true,
      message: "posts fetched successfully",
      userData,
      ourUser,
      allPosts,
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
    const ourUser = await User.findOne({ _id: userId }).select(
      "-__v -passowrd -email"
    );
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

const CommentPost = async (req, res) => {
  try {
    const { userId, content, postId } = req.body;
    const commentData = { author: userId, content, postId };
    const post = await Post.findOne({ _id: postId });
    console.log({ post });
    post.comments.push(commentData);

    const updatedPost = await post.save();
    console.log({ updatedPost });
    updatedPost
      .populate({
        path: "comments.author",
        populate: { path: "author" },
        select: "-email -password -__v",
      })
      .execPopulate();
    const tempPost = await Post.findOne({ _id: postId }).populate({
      path: "comments.author",
      populate: { path: "author" },
      select: "-email -password -__v",
    });
    res.json({
      status: true,
      message: "comment added successfully",
      comments: tempPost.comments,
    });
  } catch (error) {
    console.log(
      "error occurred while commenting on post",
      error,
      error?.message
    );
    res.json({
      status: false,
      message: "couldn't comment on the post",
      errorDetail: error,
    });
  }
};

const RemoveComment = async (req, res) => {
  try {
    const { commentId, postId } = req.body;
    console.log({ commentId, postId });
    const post = await Post.findOne({ _id: postId });
    const updatedComments = post.comments.filter(
      (comment) => !comment._id.equals(commentId)
    );
    post.comments = updatedComments;
    const response = await post.save();
    const tempPost = await Post.findOne({ _id: postId }).populate({
      path: "comments.author",
      populate: { path: "author" },
      select: "-email -password -__v",
    });
    res.json({
      status: true,
      message: "comment deleted successfully",
      comments: tempPost.comments,
    });
  } catch (error) {
    console.log("error occurred ", error, error?.message);
    res.json({
      staus: false,
      message: "couldn't delete comment",
      errroDetail: error?.message,
    });
  }
};
const FetchComments = async (req, res) => {
  try {
    const { postId, userId } = req.body;
    const post = await Post.findOne({ _id: postId }).populate({
      path: "comments.author",
      populate: { path: "author" },
      select: "-email -password -__v",
    });
    const { comments } = post;
    res.json({
      status: true,
      comments: post.comments,
      userId,
    });
  } catch (error) {
    res.json({ status: false, message: error?.message, errorDetail: error });
  }
};
async function GetPost(req, res) {
  try {
    const { postId } = req.body;
    const post = await Post.findById(postId).populate(
      "author comments comments.author",
      "-__V -password -email"
    );
    res.json({ status: true, message: "post fetched successfully", post });
  } catch (error) {
    res.json({
      status: false,
      message: "couldn;t fetch post",
      errorDetail: error?.message,
    });
  }
}
async function FetchPostsByUser(req, res) {
  try {
    const { getUserId } = req.body;
    const response = await User.findById(getUserId)
      .select("-__v -password -email")
      .populate("posts")
      .populate({
        path: "posts",
        populate: {
          path: "author comments comments.author",
        },
      });
    const { posts } = response;
    res.json({
      status: true,
      message: "posts of user fetched successfully",
      posts,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "couldn;t fetch posts of a user",
      errorDetail: error?.message,
    });
  }
}
module.exports = {
  FetchAllPosts,
  CreatePost,
  LikeInteraction,
  CommentPost,
  RemoveComment,
  FetchComments,
  GetPost,
  FetchPostsByUser,
};
