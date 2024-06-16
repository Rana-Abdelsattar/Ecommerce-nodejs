


import mongoose, {Schema,model} from 'mongoose'

const categorySchema= new Schema({
    name:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    slug:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    Image:{
        secure_url:{type:String , required:true},
        public_id:{type:String , required:true , unique:true}
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
        ref:'user',
    }

},
{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})


// virtual relationship with sub-category

categorySchema.virtual('sub-categories',{
    ref:'SubCategory',
    localField:'_id',
    foreignField:'categoryId'

})

const Category=model('Category',categorySchema)

export default mongoose.models.Category || Category