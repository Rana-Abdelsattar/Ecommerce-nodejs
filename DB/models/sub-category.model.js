import mongoose, {Schema,model} from 'mongoose'

const subCategorySchema= new Schema({
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
        ref:'user'
    },
    categoryId:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        required:true
    }

},
{
    timestamp:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

// virtual populate 
subCategorySchema.virtual('Brands',{
    ref:'Brand',
    localField:'_id',
    foreignField:'subCategoryId'
})

const SubCategory=model('SubCategory',subCategorySchema)

export default mongoose.models.SubCategory || SubCategory