import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
    idTelegram:{
        type: String,
        trim:true,
        unique:true
    },
    wallet:{
        type: String,
        unique:true,
        trim:true,
    },
    languaje:{
        type: String,
        trim:true,
    },
    region:{
        type:String,
        required:true,
        trim:true,
    },
    active:{
        type:Boolean,
        default:true,
    },
    idReferal:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }
},{
    timestamps:true
})

export default mongoose.model('User',userSchema);