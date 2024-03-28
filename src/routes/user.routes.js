import { Router } from "express";
import {
  userRegister,
  userLogin,
  userLogout,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  getCurrentUser,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelDetails,
  getWatchHsitory,
} from "../Controllers/users.controller.js";
import { upload } from "../Middlewares/multer.middlewares.js";
import { verifyJWT } from "../Middlewares/auth.middlewares.js";

const userRouter = Router();

// Defining the route for handling the user registration and all the loginc for handling the user registeration is written in users.controllers.js file

// Here we are also using a middleware for also handling the file (multer middleware) while registering of the user

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar", //The name should be same with "name" attribute in the form,
      maxCount: 1,
    },
    {
      name: "coverImage", //The name should be same with "name" attribute in the form,
      maxCount: 1,
    },
  ]),
  userRegister
);

// Route for the user login
userRouter.route("/login").post(userLogin);

// Route for user logout(here we are also using the verifyJWT middleware for the user logout)
userRouter.route("/logout").post(verifyJWT, userLogout);

// Route for regenrating the acces token and refresh token
userRouter.route("/refresh-token").post(refreshAccessToken);

// Creating a route for changePassowrd with authorizing of the user using th verifyJWT middleware
userRouter.route("/change-passwor").post(verifyJWT, changeCurrentPassword);

// Creating a route for updating user details with authorizing of the user using th verifyJWT middleware
userRouter.route("/update-account").patch(verifyJWT, updateAccountDetails);

// Creating a route for getting the current loggedIn user details with authorizing of the user using th verifyJWT middleware
userRouter.route("/curr-user").get(verifyJWT, getCurrentUser);

// Creating a route for changing  the avatar image of the current loggedIn user details with authorizing of the user using th verifyJWT middleware and multer middleware for file uploading
userRouter
  .route("/change-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// Creating a route for changing  the cover image of the current loggedIn user details with authorizing of the user using th verifyJWT middleware
userRouter
  .route("/change-covImg")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

// Creating a route for getting the details of a particular channel with authorizing of the user using th verifyJWT middleware and in this we are getting the username from the url
userRouter.route("/c/:username").get(verifyJWT, getUserChannelDetails);

// Creating a route to get the watch history of the current user
userRouter.route("/history").get(verifyJWT, getWatchHsitory);

export default userRouter;
