import mongoose, { Schema,model } from "mongoose";


const brandSchema=new Schema({
    name:{
        type:String,
        required:true,
        trime:true,
        lowercase:true
    },
    slug:{
        type:String,
        required:true,
        trime:true,
        lowercase:true,
         
    },
    Image:{
        secure_url:{type:String,required:true},
        public_id:{type:String,required:true,unique:true},
    },
    folderId:{
        type:String,
        required:true,
        unique:true
    },
    AddedBy:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    updatedBy:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    categoryId:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    subCategoryId:{
        type:Schema.Types.ObjectId,
        ref:'SubCategory',
        required:true
    }
},
    {timestamps:true})



    const Brand=model('Brand',brandSchema)


    export default mongoose.models.Brand || Brand