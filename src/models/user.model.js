import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { jwt } from "jsonwebtoken";

// Define the user schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true, // Remove leading and trailing spaces from the username
      index: true, // Index can be used while searching
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true, // Remove leading and trailing spaces from the email
    },
    fullName: {
      type: String,
      required: true, // The full name field is required
      trim: true, // Remove leading and trailing spaces from the full name
    },
    avatar: {
      type: String, // Store only the URL of the avatar image
      required: true,
    },
    coverImage: {
      type: String, // Store only the URL of the cover image
    },
    password: {
      type: String,
      required: true,
    },
    // Refresh token field
    refreshToken: {
      type: String,
      required: true, // The refresh token field is required
    },
    // Watch history field
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video", // Reference to the Video model
      },
    ],
  },
  { timestamps: true }
); // Include createdAt and updatedAt fields

// Middleware to hash the password before saving the user document using the bcrypt
userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check if the password is correct using the bcrypt package
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Function for generating the acces  token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    // Payload data
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Function for generating the refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    // Payload data
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
// Create the User model
export const User = new mongoose.model("User", userSchema);
