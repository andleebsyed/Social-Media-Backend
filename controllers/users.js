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
    const user = await User.findById(userId, "-__v -password").populate(
      "likedPosts posts"
    );
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
  try {
    const { userId, updateData } = req.body;
    console.log({ updateData }, { userId });
    const { coverPic, avatar, name, bio } = updateData;
    let user = await User.findById(userId);
    user = { ...user, name: name, bio: bio };

    if (coverPic) {
      await cloudinary.uploader.upload(coverPic.tempFilePath, (err, result) => {
        if (err) {
          console.log("Error occurred while uploading coverPic");
          return res.status(500).json({
            status: false,
            message: "image uploadation to cloudinary failed",
            errorDetail: err,
          });
        } else {
          const newCoverPic = result.secure_url;
          user = { ...user, coverPic: newCoverPic };
        }
      });
    }
    if (avatar) {
      await cloudinary.uploader.upload(avatar.tempFilePath, (err, result) => {
        if (err) {
          console.log("Error occurred while uploading avatar");
          return res.status(500).json({
            status: false,
            message: "image uploadation to cloudinary failed",
            errorDetail: err,
          });
        } else {
          const newAvatar = result.secure_url;
          user = { ...user, avatar: newAvatar };
        }
      });
    }

    const response = await user.save();
    return res.json({
      status: true,
      message: "user updated successfully",
      updatedUser: response,
    });
  } catch (error) {
    return res.json({
      status: false,
      message: "couldn't update user",
      errorDetail: error?.message,
    });
  }
}
module.exports = { SignUp, SignIn, UserDetails, UpdateUser };
