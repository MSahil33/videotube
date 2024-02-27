// Creating a multer middleware

// Multer is a library that is being used for the file  uploads in this

import multer from "multer";

// Storing the file in the local disk storage using the multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
