const express = require("express");
const {
  SignIn,
  SignUp,
  UserDetails,
  UpdateUser,
  GetAllUsers,
  GetUser,
} = require("../../controllers/users");
const userRoute = express.Router();
const { verifyToken } = require("../../middlewares/verifyToken");
userRoute.post("/signin", SignIn);
userRoute.post("/signup", SignUp);
userRoute.post("/", verifyToken, UserDetails);
userRoute.post("/update", verifyToken, UpdateUser);
userRoute.post("/allusers", verifyToken, GetAllUsers);
userRoute.post("/getuser", verifyToken, GetUser);

module.exports = { userRoute };
