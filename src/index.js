import dotenv from "dotenv";
import connectDb from './Db/db_index.js';
import { app } from "./app.js";

// but we can use modular syntax of the dotenv as follows with the config method


// Note : while using modular syantx for using dotenv make sure that you use this flag "-r dotenv/config --experimental-json-modules ' while running the application 
dotenv.config({
    path:"./.env"
})

// This is the default of the dotenv 
// require('dotenv').config({path:'./env'});

connectDb()
.then(()=>{
    app.get("/",(req,res)=>{
        res.send("Server started")
    })

    app.listen(process.env.PORT || 8500,()=>{
        console.log("Server listening at : ",process.env.PORT)
    })
})
.catch((err)=>{
    console.log("MongoDB Connection Failed : ",err);
    process.exit(1);
});

// console.log(process.env.MONGODB_URL);
