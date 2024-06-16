import Coupon from '../../../DB/models/coupon.model.js'
import CouponUser from '../../../DB/models/coupon-users.model.js'
import user from '../../../DB/models/user.model.js'
import { applyCouponValidation } from '../../Utils/apply-coupon.js';

// =========================add Coupon api================================

export const addCoupon=async(req,res,next)=>{

const{couponCode,couponAmount,isFixed,isPercentage,fromDate,toDate,users}=req.body;
const{_id:addedBy}=req.authUser;

// check if coupon already exists
const coupon=await Coupon.findOne({couponCode});
if(coupon) return next(new Error('this coupon already exists'),{cause:409})

if(isFixed == isPercentage) return next(new Error('coupon should be either a number or percentage'))

if(isPercentage)
{
    if(couponAmount>100) return next(new Error('coupon amount should be less than 100'))
}

const couponObj={
    couponCode,
    couponAmount,
    isFixed,
    isPercentage,
    fromDate,
    toDate,
    addedBy
}

//users ==> from postman as >[{userId,maxUsage}]add couponId to become like this ====>[{userId,maxUsge,couponId}]
// check if user in users array not found in db
const usersIds=[]
for (const user of users) {
   usersIds.push(user.userId) 
}
const isUserExists=await user.find({_id:{$in:usersIds}})
if(isUserExists.length != usersIds.length) return next(new Error('user not found'))

const newCoupon=await Coupon.create(couponObj)


//create coupon users model
await CouponUser.create(users.map((ele)=>{return {...ele,couponId:newCoupon._id}}))

res.status(201).json({
    sucess:true,
    message:"coupon created successfully",
    data:newCoupon
})

}

// =============================get All coupons with it's owners========================

export const getAllCoupons=async(req,res,next)=>{

    const AllCoupons=await Coupon.find().populate([{
        path:'valid-For'
    }]);
    if(!AllCoupons.length) return next(new Error('there is no coupons'))

    res.status(201).json({
        sucess:true,
        message:"All Coupons",
        data:AllCoupons
    })
}

// =================================get Coupon by code=========================
export const getCouponByCode=async(req,res,next)=>{
    const {couponCode}=req.body
    const coupon = await Coupon.findOne({couponCode})
    if(!coupon) return next(new Error('there is no coupon'))

    res.status(201).json({
        success:true,
        message:"Coupon",
        data:coupon
    })

}

// ==================================update coupon=========================

export const updateCoupon=async(req,res,next)=>{
    const{_id:updatedBy}=req.authUser
    const{NewcouponCode,oldCouponCode,couponAmount,isFixed,isPercentage,fromDate,toDate,users}=req.body;


    // check if coupon exists
    const coupon=await Coupon.findOne({couponCode:oldCouponCode})
    if(!coupon) return next(new Error('Coupon not found'))

    if(NewcouponCode) {
        const isCouponExists = await Coupon.findOne({couponCode:NewcouponCode})
        if(isCouponExists) return next(new Error('CouponCode already exists'))
        coupon.couponCode=NewcouponCode
    }
if(isFixed){
    coupon.isFixed=isFixed
    coupon.isPercentage=false
}
 if(isPercentage)
 {
    if(coupon.couponAmount>100 && !couponAmount) return next(new Error('coupon amount should be less tham 100'))
    coupon.isPercentage=isPercentage
    coupon.isFixed=false

 }
 if(couponAmount){
    if(couponAmount>100)  return next(new Error('coupon amount should be less tham 100'))
    coupon.couponAmount=couponAmount
 }
     if(users)
    {
    const usersIds=[]
    for (const user of users) {
    usersIds.push(user.userId) 
     }
     const isUserExists=await user.find({_id:{$in:usersIds}})
    if(isUserExists.length != usersIds.length) return next(new Error('user not found'))
   
    // check if user already has this coupon
    const isUserHasThisCoupon=await CouponUser.findOne({couponId:coupon._id,userId:{$in:usersIds}})
    console.log(isUserHasThisCoupon)
    if(isUserHasThisCoupon) return next(new Error('This user already has this couppon'))

//create coupon users model
    await CouponUser.create(users.map((ele)=>{return {...ele,couponId:coupon._id}}))
   }

    if(fromDate) coupon.fromDate=fromDate
    if(toDate) coupon.toDate=toDate
    coupon.updatedBy=updatedBy

    await coupon.save()

    res.status(201).json({
        success:true,
        message:'coupon updated successfully',
        data:coupon
    })
}
//=========================================delete coupon and its owners

export const deleteCoupon=async(req,res,next)=>{
    const{couponCode}=req.body

    const coupon=await Coupon.findOneAndDelete({couponCode})

    if(!coupon) return next(new Error('coupon not found'))
    console.log(coupon)

    //delete owners of this coupon
    await CouponUser.deleteMany({couponId:coupon._id})
    
    res.status(201).json({success:true,message:"coupon deleted successfully"})

}

// ==============================apply coupon api====================

export const useCoupon=async(req,res,next)=>{
    const{couponCode}=req.body;
    const{_id:userId}=req.authUser
     
    // applyCouponValidation
    const isCouponValid= await applyCouponValidation(couponCode,userId)
    if(isCouponValid.status) return next(new Error(isCouponValid.msg),{cause:isCouponValid.status})

    res.status(201).json({
        success:true,message:"coupon is valid",coupon:isCouponValid
    })
}