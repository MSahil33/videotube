import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadToCloud } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

// creating a controllers for handling all the user related operation

const userRegister = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //     message:"ok",
  // })

  // Steps for registering the user

  // 1. Getting the details from the application or frontend
  // 2. validation(such as checking whether it is empty or not)
  // 3. Checking whether the user already exists(we can check this using email or username)
  // 4. Checking for the image(avatar,cover image..etc)
  // 5. uploading the image from local server to a cloud server(such as cloudinary)
  // 6. Creating a user entry in the database as a user-object
  // 7. Removing the password and refresh token from the response
  // 8. Checking whether the user is created or not
  // 9. Return the response back to the app or frontend(based on the user creation  if created succesfully return success response else failure response )

  // Step-1 :  Getting the user details
  const { fullName, username, email, password } = req.body;

  // Step-2 : Validation (checking whether the any of the fiel is empty )

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // -------------------------------or-------------------------------

  // if(fullName===""){
  //     throw new ApiError(400,"Full Name is required");
  // }else if(email==""){
  //     throw new ApiError(400,"Email is required");
  // }else if(username==""){
  //     throw new ApiError(400,"username is required");
  // }else if(password==""){
  //     throw new ApiError(400,"Password is required");
  // }

  // Step-3 : Checking whether the user already exist or not(using the email and username)

  const existingUserEmail = User.findOne({ email });
  const existingUserName = User.findOne({ username });

  // console.log(existingUserEmail);
  // console.log(existingUserName);

  if (existingUserName) {
    throw new ApiError(409, "Username is not available");
  }

  if (existingUserEmail) {
    throw new ApiError(409, "email id is already registered!!");
  }

  //   or
  //   const existingUser = User.findOne({
  //     $or: [{ username }, { email }],
  //   });

  //   if (existingUser) {
  //     throw new ApiError(409, "User already exist!!");
  //   }

  // Step-4 : Checking for the image(avatar,cover image..etc)

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // Step-5 : Uploading the images to the cloudinary
  //  we can use the already created function in the utils file

  const avatar = await uploadToCloud(avatarLocalPath);
  const coverImage = await uploadToCloud(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar image not uploaded");
  }

  // Step-6 : Creating a entry into the database as a userobject

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", //It is a optional field
  });

  const getNewUser = User.findById(user._id).select("-password -refreshToken");

  // 8. Checking whether the user is created or not
  if (!getNewUser) {
    throw new ApiError(500, "Something went wrong while registering a user!!");
  }

  //   9. Sending back the data to the application or the frontend

  res.status(201).json(
    new ApiResponse(200,getNewUser,"User created succesfully!!")
  )

});

export default userRegister;
