
import mongoose, { Schema,model } from "mongoose";



const productSchema=new Schema({

    //strings
title:{type:String , required:true, trim:true},
desc:String,
slug:{type:String , required:true},
folderId:{type:String , required:true,unique:true},

//numbers
basePrice:{type:Number , required:true},
discount:{type:Number , default:0},
appliedPrice:{type:Number , required:true},
stock:{type:Number , required:true , min:0 , default:0},
rate:{type:Number , required:true , min:0 , max:5 , default:0},

//arrays
Images: [{
  secure_url: { type: String, required: true },
  public_id: { type: String, required: true, unique: true }
}],
// this field will be object of arrays of diferent types
/*{
  color: ['red','green'],
  size: [128,265]
  }
*/
//specifications
specs:{
     type:Map,   //Map refer to object
     of:[String | Number]
},

//objectIds
addedBy:{type:Schema.Types.ObjectId , ref:'user' , required:true},
updatedBy:{type:Schema.Types.ObjectId , ref:'user' },
categoryId:{type:Schema.Types.ObjectId , ref:'Category' , required:true},
subCategoryId:{type:Schema.Types.ObjectId , ref:'SubCategory' , required:true},
brandId:{type:Schema.Types.ObjectId , ref:'Brand' , required:true}



},
{timestamps:true,
toJSON:{virtuals:true},
toObject:{virtuals:true}})


productSchema.virtual('Reviews',{
  ref:'Review',
  localField:'_id',
  foreignField:'productId'
})

const Product=model('Product',productSchema)

export default mongoose.models.Product || Product 