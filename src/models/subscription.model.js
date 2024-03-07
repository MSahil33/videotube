import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({

    // The user  who is subscribing 
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    
    // The channel to which the user is subscribing 
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});



export const Subscription = new mongoose.model("Subscription",subscriptionSchema);

