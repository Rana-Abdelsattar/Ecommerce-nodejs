import mongoose, { Schema } from "mongoose";

const coupunUsersSchema=new mongoose.Schema({
 
    couponId:{
        type:Schema.Types.ObjectId,
        ref:'Coupon',
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    maxUsage:{
        type:Number,
        min:1,
        required:true
    },
    usageCount:{
        type:Number,
        default:0
    }


},{timestamps:true})

const CouponUser=mongoose.model('CouponUser',coupunUsersSchema)

export default mongoose.models.CouponUser || CouponUser