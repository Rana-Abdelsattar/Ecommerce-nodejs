import multer from 'multer'
import allowedExtensions from '../Utils/allowed-extensions.js'


export const multerMiddleWare=(extensions=allowedExtensions.IMAGE)=>{


    const storage=multer.diskStorage({
       filename:function(_,file,cb){    //_ mean unused req
        cb(null,file.originalname)
       }
    
    })

    const fileFilter=function(_,file,cb){   // _ means req but not used
   
        if(extensions.includes(file.mimetype.split('/')[1]))   
        {
            cb(null,true)
        }else{
            cb(new Error('File format not allowed'),false)
        }
    }
 
 
    const file=multer({fileFilter,storage})
    return file
 
 }