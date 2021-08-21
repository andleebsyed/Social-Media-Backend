const express = require("express");
const {
  SignIn,
  SignUp,
  UserDetails,
  UpdateUser,
  GetAllUsers,
} = require("../../controllers/users");
const userRoute = express.Router();
const { verifyToken } = require("../../middlewares/verifyToken");
userRoute.post("/signin", SignIn);
userRoute.post("/signup", SignUp);
userRoute.post("/", verifyToken, UserDetails);
userRoute.post("/update", verifyToken, UpdateUser);
userRoute.post("/allusers", verifyToken, GetAllUsers);

module.exports = { userRoute };
