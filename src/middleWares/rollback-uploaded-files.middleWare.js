

import cloudinaryConnection from "../Utils/cloudinary.js"

// this middleware used if there is unexcepected error after uploading file in cloudinary
// it deletes the uploaded image if there is error after uploading 


export const rollBackUploadedFiles=async(req,res,next)=>{


if(req.folder)
{
    await cloudinaryConnection().api.delete_resources_by_prefix(req.folder)
    await cloudinaryConnection().api.delete_folder(req.folder)
}
next()

}




