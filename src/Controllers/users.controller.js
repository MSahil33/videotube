import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadToCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

  // Now seeting the options for the cookies
  const options = {
    http: true,
    secure: true,
  };

  // Now sending the response back


  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"));
});

export { userRegister, userLogin, userLogout };
