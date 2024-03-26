import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User, User } from "../models/user.model.js";
import { uploadToCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Here is the secure options to be used while setting the cookies
// Now seeting the options for the cookies
const options = {
  http: true,
  secure: true,
};

// creating a controllers for handling all the user related operation

// Method to generate a access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    // Generating the refresh token (using the methods defined which are associated with the user_model define in the user.model.js file)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Saving the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ ValiditeBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and acces token!"
    );
  }
};

// User registration handling
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

  // if (
  //   [fullName, email, username, password].some((field) => field?.trim() === "")
  // ) {
  //   throw new ApiError(400, "All fields are required");
  // }

  // -------------------------------or-------------------------------

  if (fullName === "") {
    throw new ApiError(400, "Full Name is required");
  } else if (email == "") {
    throw new ApiError(400, "Email is required");
  } else if (username == "") {
    throw new ApiError(400, "username is required");
  } else if (password == "") {
    throw new ApiError(400, "Password is required");
  }

  // Step-3 : Checking whether the user already exist or not(using the email and username)

  const existingUserEmail = await User.findOne({ email });
  const existingUserName = await User.findOne({ username });

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

  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

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

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 8. Checking whether the user is created or not
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user!!");
  }

  //   9. Sending back the data to the application or the frontend

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created succesfully!!"));
});

// User login handling

const userLogin = asyncHandler(async (req, res) => {
  // Steps for handling the user login
  // 1. Get the data from the user
  // 2. Validation on the inputs
  // 3. Check for email id or username
  // 4. find that user through its email or username
  // 5. Check for the matching password with that username or email
  // 6. If user found succesfully generate the access and refresh token
  // 7. then send the user object to the frontend through secure cookies

  // Step-1 : Getting the user details

  const { username, email, password } = req.body;

  // Step-2 & 3: Validation on the inputs

  if (!(email || username)) {
    throw new ApiError(400, "username or password is required!");
  }

  // Step-4 : Getting or finding the user with the email or password

  const getUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // Step-5 : checking whether the user is registered or not

  if (!getUser) {
    throw new ApiError(404, "No user with this email or username exists");
  }

  // Step-6 : Checking for the password
  // we are using the methods created for encryption and comparison of user password with the database password

  const isPasswordValid = await getUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is invalid!");
  }

  // Step-7 : Generating acces and refresh token

  // getting from the user defined function above
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    getUser._id
  );

  // Step-8 : Sending the token through the cookies to the user

  // getting a user with the updated refresh token
  // by ignoring the password and refreshTojken field
  const loggedInUser = await User.findById(getUser._id).select(
    "-password -refreshToken"
  );

  // Creating a secure options for the cookies which means that by this options only the server has the acces to modify it
  const options = {
    http: true,
    secure: true,
  };

  // returning the response along with the cookie and its secure options
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

// User logout handling
const userLogout = asyncHandler(async (req, res) => {
  // Now we are getting the user_id or user_object of the current logged in user in the body of the request(we have added this in the body of the request through the middleware whuch verify and adds the jwt accesToken into the body)

  const userId = req.user._id;

  // now updating the refreshToken in the current user document in the database
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  // Now sending the response back

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// instead of asking for the login credentials for each time he vsiits the website we can store the acces and refresh token in the browser and refreshToken into the database

// Note : accesToken has a short lifetime and refreshToken has the  long lifetime
// By using the accesToken we can authorized the user without its login credentials
// As the accesToken has the short lifetime so we can generate it again using the refreshToken stored in the cookie of the local browser and database entry of that user

// whenever a user visits or request we can use this accesToken to authorize the user

// Creating a method to refresh or regenerate the acces token such that the user does not need to enter the login credentials whenever he visit the site

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    // Getting the already saved refresh token in the request body from the client side
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Now decoding the token saved in the cookies in encrypted using jwt
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Now this token has the user id of the current logged in user which we have saved in the cookie so now accessing that user_id from the decodedToken

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Now checking whether the refreshToken stored in the database entry of the user and local storage cookie of the user
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(
        401,
        "Invalid refresh token or refresh token is expired"
      );
    }

    // Now generate a new access and refreshtoken
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    // now returning back the response by setting the new acces and refreshtoken

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "access token re-generated succesfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// Controller for changing the password

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // Getting the old and new password from the user while changing the current password
  // Getting from the current user

  const { oldPassword, newPassword } = req.body;

  // As the user is currently logged in and trying to chenge the password we can get the current logged in user from the request
  // As we are checking whther the user is logged in or not in the verifyJWT middleware

  const user_id = req.user?._id;

  // Now getting the user from the database using the user_id
  const curr_user = await User.findById(user_id);

  // Now checking whther the oldPassword is correct or not using the isPasswordCorrect method createad in the user.model.js file

  const isPaswordCorrect = await User.isPasswordCorrect(oldPassword);

  if (!isPaswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }

  // Setting the new password
  curr_user.password = newPassword;
  // And saving in the database
  await curr_user.save({ ValiditeBeforeSave: false });

  // Returing the response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Succesfully"));
});

// Getting the current loggedIn User
const getCurrentUser = asyncHandler(async (req, res) => {
  // Getting this user from the middeleware which we used to verifyJWt of that user
  const currUser = req.user;

  return res
    .status(200)
    .json(new ApiResponse(200, currUser, "Current user fetched succesfully!!"));
});

// Controller for updating the accountDetails (without the updation of avatar & coverImage)

const updateAccountDetails = asyncHandler(async (req, res) => {
  // Here we are only updating the fullName ,email and username of that user

  const { fullName, email, username } = req.body;

  if (!fullName || !email || !username) {
    throw new ApiError(400, "All fields are required!!");
  }

  // Updating the details
  const user_id = req.user?._id;
  const updated_user = await findByIdAndUpdate(
    user_id,
    {
      // $set operator is used to update in the database
      $set: {
        fullName: fullName,
        email: email,
        username: username,
      },
    },
    { new: true } //This will return the object of the new updated user
  ).select("-password");

  // Returning the response
  return res
    .status(200)
    .json(
      new ApiResponse(200, updated_user, "User details updated succesfully!!")
    );
});

// Updating the avatar image
const updateUserAvatar = asyncHandler(async (req, res) => {
  // Getting the local file path from the multer middleware which we have created

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is missing!!");
  }

  // Uploading this local file to the cloudinary server
  const avatar = await uploadToCloud(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(
      400,
      "Error while uploading the avatar image to the cloud!!"
    );
  }

  // Now saving the new path into the database without getting the password ield in the response
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      // $set is used to update the values in to the database
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true } //This will return the new updated user
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar image updated succesfully!!")
    );
});

// Updating the cover image
const updateCoverImage = asyncHandler(async (req, res) => {
  // Getting the local file path from the multer middleware which we have created

  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is missing!!");
  }

  // Uploading this local file to the cloudinary server
  const coverImage = await uploadToCloud(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(
      400,
      "Error while uploading the cover image to the cloud!!"
    );
  }

  // Now saving the new path into the database without getting the password ield in the response
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      // $set is used to update the values in to the database
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true } //This will return the new updated user
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover image updated succesfully!!")
    );
});

// Controller for getting the channel profile details using mongodb aggregation pipelines

const getUserChannelDetails = asyncHandler(async (req, res) => {
  // Getting the channel name or channel user user_name from the url

  const username = req.params;

  if (!username?.trim()) {
    throw new ApiError(401, "Missing channel or username");
  }

  // Creating a mongodb aggregation pipleine to get the no. of subscriber to that channel and the no. of channels to which the current viweing channels is subscribedTo

  // It is similar to join operation in the sql queries for counting the no. of subscribers by joining the two tables

  //Mongodb aggregation pipelines
  const channel = await User.aggregate([
    // 1st pipeline : firstly getting the channel details from the channel username acquired above
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },

    // 2nd pipeline : joining the user document with the subscription document to get the list of  documents of all subscribers for the current equipped channel username suing lookup functionality in mongodb

    {
      $lookup: {
        from: "subscriptions", //name of the document to which it has to be joined
        localField: "_id", //based on the current user_name and channel id  we are joining with subscriptions collection (similar to where clause or "ON" operation in join )
        foreignField: "channel",
        as: "subscribers",
      },
    },
    // 3rd pipeline to get the list of all channels to which the current user or channel is subscribed to
    {
      $lookup: {
        from: "subscriptions", //name of the document to which it has to be joined
        localField: "_id", //based on the current user_name and channel id  we are joining with subscriptions collection (similar to where clause or "ON" operation in join )
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    // 4th pipeline to create or add a new field in the documnent to count the no. of subscriber and no. of channels to which the current user is susbscribedTo.

    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelUserSubscribedToCount: {
          $size: "$subscribedTo",
        },

        // Now adding a new field to the document whether the current logged user is subscribed to the viewing channel or not
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },

    // 5th pipeline to get only the neccesary fiels which are required to show on the user channel
    {
      // Using project we can set the fields on which  we want our response to consist and senf it to the user
      $project: {
        username: 1,
        email: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelUserSubscribedToCount: 1,
        isSubscribed: 1,
      },

      // only the above mentioned field will get to front end
    },
  ]);

  // Now sending the channel to the frontend

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channel[0],
        "User channel details fetched successfully"
      )
    );
});

export {
  userRegister,
  userLogin,
  userLogout,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateCoverImage,
};
