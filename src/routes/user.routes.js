import { Router } from "express";
import userRegister from "../Controllers/users.controller.js";
import {upload} from "../Middlewares/multer.middlewares.js";

const userRouter = Router();

// Defining the route for handling the user registration and all the loginc for handling the user registeration is written in users.controllers.js file

// Here we are also using a middleware for also handling the file (multer middleware)

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

export default userRouter;
