const express = require("express");
require("dotenv").config();
const cors = require("cors");
const fileupload = require("express-fileupload");
// const cloudinary = require("cloudinary").v2;
const { DbConnection } = require("./database/dbConnection");
const { userRoute } = require("./routes/userRoute/userRoute");
const { postsRoute } = require("./routes/postsRoute");
const { verifyToken } = require("./middlewares/verifyToken");
const app = express();

app.use(express.json());
app.use(cors());
app.use(
  fileupload({
    useTempFiles: true,
  })
);
DbConnection();
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "welcome to entry point of social media backend",
  });
});

app.use("/users", userRoute);
app.use("/posts", verifyToken, postsRoute);
app.listen(9000, () => console.log("server is up and running"));
