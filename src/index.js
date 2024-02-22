import express from 'express';
import dotenv from "dotenv";
import connectDb from './Db/db_index.js';


// but we can use modular syntax of the dotenv as follows with the config method


// Note : while using modular syantx for using dotenv make sure that you use this flag "-r dotenv/config --experimental-json-modules ' while running the application 
dotenv.config({
    path:"./env"
})

// This is the default of the dotenv 
// require('dotenv').config({path:'./env'});
// const app = express();

connectDb();

// console.log(process.env.MONGODB_URL);
