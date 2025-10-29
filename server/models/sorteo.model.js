import mongoose from "mongoose";

const sorteoSchema= new mongoose.Schema({
    numeroSorteo:{
        type: String,
        trim:true,
        required:true
    },
    fechaDeSorteo:{
        type: String,
        trim:true,
        required:true
    },
    resultado:{
        type: String,
        trim:true,
        default:''
    },
    ejecutado:{
        type: Boolean,
        default:false
    },
    cantidadGanadores:{
        type: Number,
        default:0
    },
    prizePool:{
        type: Number,
        trim:true,
        default:'0'
    }
},{
    timestamps:true
})

export default mongoose.model('Sorteo',sorteoSchema);