import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiErrors";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

// Creating a middleware for verifying the acces token such that only authhorized user can acces the app

// we can use this middle ware in the routes
export const verifyJWT = asyncHandler(async (req, res, next) => {

  try {
    // Getting the acces of the token which is sent during the user logged in the header body

    const token =
      (await req.cookies?.accessToken) ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Getting all the data such as user_id and other information from the token which is encrypted with the secret key so it has to be decrypted with the same secret key as follows
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Now getting the user object from the database through the user_id (which is get from the decodeToken)
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Acces Token!");
    }

    // Now apending the user object into the req body such that the we can acces the user data from the user_request when it goes to the server for any access opeartion

    // Now it act as a middleware
    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Acces Token!");

  }
});
