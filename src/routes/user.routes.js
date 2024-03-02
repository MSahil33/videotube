import { Router } from "express";
import { userRegister,userLogin, userLogout } from "../Controllers/users.controller.js";
import {upload} from "../Middlewares/multer.middlewares.js";
import {verifyJWT} from "../Middlewares/auth.middlewares.js";

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
userRouter.route("/logout").post(verifyJWT,userLogout);

export default userRouter;
