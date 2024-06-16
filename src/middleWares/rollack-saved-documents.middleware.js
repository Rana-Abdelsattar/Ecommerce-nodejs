

// this middleware to delete saved documents if thete unexpected file agter save documents 


export const rollbackSavedDocuments=async(req,res,next)=>{

    if(req.savedDocument)
    {
   
        const{model,_id}=req.savedDocument
        await model.findByIdAndDelete(_id)
    }
}