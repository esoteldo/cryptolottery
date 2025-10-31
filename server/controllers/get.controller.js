

export const getPrices=async(req,res)=>{

    try {

        res.status(200).json({message:"Hello from getPrices"})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error.message})
    }


}

export const getLastWinners=async(req,res)=>{

    try {
        
        res.status(200).json({message:"Hello from getLastWinners"})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error.message})
    }


}

export const searchWinners=async(req,res)=>{

    try {
        
        res.status(200).json({message:"Hello from searchWinners"})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error.message})
    }

}

export const getInitData=async(req,res)=>{

    try {
        const userId = req.params.id;
        
        console.log(userId)
        
        res.status(200).json({id:userId})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error.message})
    }

}
