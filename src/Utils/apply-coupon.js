

import { DateTime } from 'luxon'
import Coupon from '../../DB/models/coupon.model.js'
import CouponUser from '../../DB/models/coupon-users.model.js'

export async function applyCouponValidation(couponCode,userId){
 
    //check couponCode
const coupon=await Coupon.findOne({couponCode})
if(!coupon) return {msg:'invalid coupon',status:400}

   //check couponStatus

   if(coupon.status=='expired' || DateTime.now() > DateTime.fromISO(coupon.toDate))
   {
    return {msg:'coupon expired',status:400}
   }

   //start Date check
   if(DateTime.fromISO(coupon.fromDate) > DateTime.now())
   {
    return {msg:'coupon not start yet',status:400}
   }
   
   //user  check
   const isUserAssigned=await CouponUser.findOne({couponId:coupon._id,userId})
   if(!isUserAssigned) return {msg:'This coupon not assigned to you',status:400}

   //check usage
   if(isUserAssigned.maxUsage <= isUserAssigned.usageCount) return {msg:'You have exceed the usage of this cpupon',status:400}


return coupon

}