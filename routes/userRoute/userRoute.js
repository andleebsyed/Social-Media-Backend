const express = require("express");
const {
  SignIn,
  SignUp,
  UserDetails,
  UpdateUser,
  GetAllUsers,
  GetUser,
  FollowNewUser,
  UnfollowUser,
  FetchNotifications,
  GuestAccess,
} = require("../../controllers/users");
const userRoute = express.Router();
const { verifyToken } = require("../../middlewares/verifyToken");
userRoute.post("/signin", SignIn);
userRoute.post("/signup", SignUp);
userRoute.post("/guest", GuestAccess);

userRoute.post("/", verifyToken, UserDetails);
userRoute.post("/update", verifyToken, UpdateUser);
userRoute.post("/allusers", verifyToken, GetAllUsers);
userRoute.post("/getuser", verifyToken, GetUser);
userRoute.post("/follow", verifyToken, FollowNewUser);
userRoute.post("/unfollow", verifyToken, UnfollowUser);
userRoute.post("/notifications", verifyToken, FetchNotifications);

module.exports = { userRoute };
