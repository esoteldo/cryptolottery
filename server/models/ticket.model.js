import mongoose from "mongoose";

const ticketSchema= new mongoose.Schema({
    idSorteo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Sorteo',
        required:true
    },
    valueTicket:{
        type: String,
        trim:true,
    },
    idUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    idTransaccion:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Transaccion',
        required:true
    },
    confirmada:{
        type:Boolean,
        default:false
    },
    ganador:{
        type:Boolean,
        default:false
    },
    
},{
    timestamps:true
})

export default mongoose.model('Ticket',ticketSchema);