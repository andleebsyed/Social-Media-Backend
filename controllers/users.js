const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const { User } = require("../models/user-model");
const SignUp = async (req, res) => {
  try {
    const secret = process.env.SECRET;
    let { userDetails } = req.body;
    userDetails = {
      ...userDetails,
      avatar:
        "https://res.cloudinary.com/andleebsyedcloud/image/upload/v1629091591/Image__1796-2017-01-27_kayqbq.jpg",
      coverPic:
        "https://res.cloudinary.com/andleebsyedcloud/image/upload/v1628684943/awyie73carhp4th6sczw.jpg",
      bio: "I am a travello user",
    };
    const newUser = new User(userDetails);
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);
    const SavedUser = await newUser.save();
    const token = jwt.sign({ userId: SavedUser._id }, secret, {
      expiresIn: "24h",
    });
    res.json({
      status: true,
      message: "user added successfully",
      token,
      userId: SavedUser._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.json({
        status: false,
        code: 11000,
        message: "couldn't add user",
        errorDetail: error.message,
        existingField: Object.keys(error.keyPattern)[0],
      });
    }
    res.json({
      status: false,
      message: "couldn't add user",
      errorDetail: error.message,
    });
  }
};

const SignIn = async (req, res) => {
  try {
    const secret = process.env.SECRET;
    const userDetails = req.body;
    const ourUser = await User.findOne({ username: userDetails.username });
    if (ourUser) {
      const validPassword = await bcrypt.compare(
        userDetails.password,
        ourUser.password
      );
      if (validPassword) {
        const token = jwt.sign({ userId: ourUser._id }, secret, {
          expiresIn: "24h",
        });
        res.json({
          status: true,
          allowUser: true,
          message: "logged in successfully",
          token,
          userId: ourUser._id,
        });
      } else {
        res.json({
          status: true,
          allowUser: false,
          message: "username and/or password incorrect",
        });
      }
    } else {
      res.json({
        status: true,
        allowUser: false,
        message: "username and/or password incorrect",
      });
    }
  } catch (error) {
    res.json({
      status: false,
      errorDetail: error,
      errorMesssage: error.message,
    });
  }
};

async function UserDetails(req, res) {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId, "-__v -password -email")
      .populate("likedPosts posts notifications")
      .populate({
        path: "posts",
        populate: {
          path: "author comments.author",
        },
      });
    res.json({ status: true, message: "user fetched successfully", user });
  } catch (error) {
    res.json({
      status: false,
      message: "user couldn't be located",
      errorDetail: error?.message,
    });
  }
}

async function UpdateUser(req, res) {
  let msg = "";
  try {
    const { userId, name, bio } = req.body;
    let user = await User.findById(userId);
    user.name = name;
    user.bio = bio;
    if (req?.files) {
      const { coverPic, avatar } = req?.files;
      if (coverPic !== undefined) {
        await cloudinary.uploader.upload(
          coverPic.tempFilePath,
          (err, result) => {
            if (err) {
              console.log("Error occurred while uploading coverPic");
              msg = "failed to upload cover pic";
            } else {
              const newCoverPic = result.secure_url;
              user.coverPic = newCoverPic;
            }
          }
        );
      }
      if (avatar !== undefined) {
        await cloudinary.uploader.upload(avatar.tempFilePath, (err, result) => {
          if (err) {
            console.log("Error occurred while uploading avatar");
            msg = "failed to upload avatar";
          } else {
            const newAvatar = result.secure_url;
            user.avatar = newAvatar;
          }
        });
      }
    }

    let updatedUser = await user
      .save()
      .then((t) => t.populate("posts").execPopulate());
    updatedUser.password = undefined;
    updatedUser.__v = undefined;
    return res.json({
      status: true,
      message: "user updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.log("catch block executed ", error.message);
    return res.json({
      status: false,
      message: msg,
      errorDetail: error?.message,
    });
  }
}
async function GetAllUsers(req, res) {
  try {
    const users = await User.find({})
      .select("-__v -password -email")
      .populate(
        "likedPosts posts followers following posts.author comments.author"
      );
    res.json({ status: true, mesage: "users fetced successfully", users });
  } catch (error) {
    res.json({
      status: false,
      message: "couldn't fetch users",
      errorDetail: error?.message,
    });
  }
}

async function GetUser(req, res) {
  try {
    const { getUserId } = req.body;
    const user = await User.findById(getUserId)
      .select("-__v -password -email")
      .populate("posts posts.comments followers following")
      .populate({
        path: "posts",
        populate: {
          path: "author comments.author",
        },
      });
    res.json({ status: true, message: "user fetched successfully", user });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "couldn't fetch user",
      errorDetail: error?.message,
    });
  }
}

async function FollowNewUser(req, res) {
  try {
    const { userId, newUserId } = req.body;
    const user = await User.findById(userId);
    const newUser = await User.findById(newUserId);
    user.following.push(newUserId);
    newUser.followers.push(userId);
    newUser.notifications.push(userId);
    let followerUser = await user.save();
    let followingUser = await newUser.save();
    followerUser.password = undefined;
    followingUser.password = undefined;
    res.json({
      status: true,
      message: "followed user successfully",
      data: { followerUser, followingUser },
    });
  } catch (error) {
    res.json({
      status: false,
      message: "couldn't follow the user",
      errorDetail: error?.message,
    });
  }
}
async function UnfollowUser(req, res) {
  try {
    const { userId, userToUnfollowId } = req.body;
    const user = await User.findById(userId);
    const userToUnfollow = await User.findById(userToUnfollowId);
    user.following = user.following.filter(
      (following) => !following.equals(userToUnfollowId)
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (follower) => !follower.equals(userId)
    );
    userToUnfollow.notifications = userToUnfollow.notifications.filter(
      (notification) => !notification.equals(userId)
    );

    let updatedLoggedInUser = await user.save();
    let updatedUnfollowedUser = await userToUnfollow.save();
    updatedLoggedInUser.password = undefined;
    updatedUnfollowedUser.password = undefined;
    res.json({
      status: true,
      message: "unfollowed user successfully",
      data: { updatedLoggedInUser, updatedUnfollowedUser },
    });
  } catch (error) {
    res.json({
      status: false,
      message: "couldn't unfollow the user",
      errorDetail: error?.message,
    });
  }
}
function FetchNotifications(req, res) {
  try {
    const { userId } = req.body;
    const user = User.findById(userId).populate("notifications");
    const notifications = user.notifications;
    res.json({
      status: true,
      message: "notifications fetched successfully",
      notifications,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "couldn't add notification",
      errorDetail: error.message,
    });
  }
}

const GuestAccess = async (req, res) => {
  try {
    const secret = process.env.SECRET;
    const userId = mongoose.Types.ObjectId("61214370ac4bb90848967102");
    const ourUser = await User.findById(userId);
    const token = jwt.sign({ userId: ourUser._id }, secret, {
      expiresIn: "24h",
    });
    res.json({
      status: true,
      allowUser: true,
      message: "logged in successfully",
      token,
      userId: ourUser._id,
    });
  } catch (error) {
    res.json({
      status: false,
      errorDetail: error,
      errorMesssage: error.message,
    });
  }
};
module.exports = {
  SignUp,
  SignIn,
  UserDetails,
  UpdateUser,
  GetAllUsers,
  GetUser,
  FollowNewUser,
  UnfollowUser,
  FetchNotifications,
  GuestAccess,
};
