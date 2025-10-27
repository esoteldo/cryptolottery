import mongoose from "mongoose";
import {MONGODB_ATLAS} from "./config.js"



export const connectDB= async ()=>{
    try{

        await mongoose.connect(MONGODB_ATLAS);

        console.log("Db is connected")

    } catch(err){
        console.log(err)
    }finally {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect;
  }
}