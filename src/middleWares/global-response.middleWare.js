

export const globalResponse=(err,req,res,next)=>{

        if(err)
        {
            res.status(err['cause'] || 500).json({
                message:"Catch Error",
                error:err.message,
                ErrorLocation:err.stack
            })
            next()   //next here to move to next middleware after it
        }     
}