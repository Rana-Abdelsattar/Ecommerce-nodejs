
import mongoose, { Schema,model } from "mongoose";



const ReviewSchema= new Schema({

userId:{
    type:Schema.Types.ObjectId,
    ref:'User',
    required:true
},
productId:{
    type:Schema.Types.ObjectId,
    ref:'Product',
    required:true
},
reviewRate:{
    type:Number,
    min:1,
    max:5,
    required:true,
    enum:[1,2,3,4,5]
},
reviewComment:{String}

},{timestamps:true})



const Review=model('Review',ReviewSchema)

export default mongoose.models.Review ||Review