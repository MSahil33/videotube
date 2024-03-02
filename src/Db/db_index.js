import mongoose from "mongoose";
import DB_NAME from "../constants.js";

// Connecting the database
const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.LOCAL_MONGODB_URL}/${DB_NAME}`);
        console.log(`Database url : ${process.env.LOCAL_MONGODB_URL}/${DB_NAME}`)
        
        console.log("MongoDB Connected Successfully:", connectionInstance.connection.host);
    } catch (error) {
        console.log("MongoDB Connection Error:", error);
        process.exit(0);
    }
}

export default connectDb;
