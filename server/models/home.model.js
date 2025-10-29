import mongoose from "mongoose";

const homeSchema= new mongoose.Schema({
    valorBitcoin:{
        type: String,
        trim:true,
        required:true
    },
    porcentajeBitcoin:{
        type: String,
        trim:true,
        required:true
    },
    valorEthereum:{
        type: String,
        trim:true,
        required:true
    },
    porcentajeEthereum:{
        type: String,
        trim:true,
        required:true
    },
    valorTon:{
        type: String,
        trim:true,
        required:true
    },
    porcentajeTon:{
        type: String,
        trim:true,
        required:true
    },
    idUltimoSorteo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Sorteo',
        required:true
    }

},
{
    timestamps:true
})

export default mongoose.model('Sorteo',homeSchema);