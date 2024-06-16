
import mongoose, { Schema , model} from "mongoose";


const couponSchema=new mongoose.Schema({

    couponCode:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },
    couponAmount:{
        type:Number,
        required:true,
        min:1
    },
    couponStatus:{
        type:String,
        default:"valid",
        enum:["valid","expired"]
    },
    isFixed:{
        type:Boolean,
        default:false
    },
    isPercentage:{
        type:Boolean,
        default:false
    },
    fromDate:{
        type:String,
        required:true
    },
    toDate:{
        type:String,
        required:true 
    },
    addedBy:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    updatedBy:{
        type:Schema.Types.ObjectId,
        ref:'user'
    }


},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

// virtual populate
couponSchema.virtual('valid-For',{
    ref:'CouponUser',
    localField:'_id',
    foreignField:'couponId'
})



const Coupon=model('Coupon',couponSchema)

export default mongoose.models.Coupon || Coupon