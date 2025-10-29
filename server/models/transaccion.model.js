import mongoose from "mongoose";

const transaccionSchema= new mongoose.Schema({
    boc:{
        type: String,
        trim:true,
        required:true   
    },
    lt:{
        type: String,
        trim:true,
        required:true
    },
    monto:{
        type: String,
        trim:true,
        required:true
    },
    senderWallet:{
        type: String,
        trim:true,
        required:true
    },
    idUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    confirmada:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

export default mongoose.model('Transaccion',transaccionSchema);