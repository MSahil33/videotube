import { v2 as cloudinary } from "cloudinary";
// Package for handling the file system or directory system
import fs from "fs";

// Configuring the cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Method to uploading a file on the cloudinary
const uploadToCloud = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
      //   return "File Uploading failed";
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", //This automatically detects the type of the file that is being uploaded
    });

    // file has been uploaded succesfully now
    // console.log("File is uplaoded on the cloudinary", response.url);


    // Removing the file from the local server
    fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {
    // This unlinks or deletes the file from the localally stored server when the upload to the cloud operation is failed 
    fs.unlinkSync(localFilePath);
    
    console.log("Error in File Upload : ", error);
    return null;
  }
};

export { uploadToCloud };
