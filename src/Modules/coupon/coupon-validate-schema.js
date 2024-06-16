import joi from 'joi'
import { Types } from 'mongoose'


const ObjectIdValidation=(value,helper)=>{
  const isValid=Types.ObjectId.isValid(value)
  return (isValid?value:helper.message('invalid ObjectId'))
}
// ======================add coupon schema
export const addCouponSchema={
    body:joi.object({
        couponCode:joi.string().min(3).max(10).required(),
        couponAmount:joi.number().min(1),
        isFixed:joi.boolean(),
        isPercentage:joi.boolean(),
        fromDate:joi.date().greater(Date.now()-(24*60*60*1000)).required(),
        toDate:joi.date().greater(joi.ref('fromDate')).required(),
        users:joi.array().items(joi.object({
            userId:joi.string().custom(ObjectIdValidation).required(),
            maxUsage:joi.number().min(1).required()
        }))
    })
}
// =================update coupon schema
export const updateCouponSchema={
    body:joi.object({
        NewcouponCode:joi.string().min(3).max(10),
        oldCouponCode:joi.string().min(3).max(10),
        couponAmount:joi.number().min(1),
        isFixed:joi.boolean(),
        isPercentage:joi.boolean(),
        fromDate:joi.date().greater(Date.now()-(24*60*60*1000)),
        toDate:joi.date().greater(joi.ref('fromDate')),
        users:joi.array().items(joi.object({
            userId:joi.string().custom(ObjectIdValidation).required(),
            maxUsage:joi.number().min(1).required()
        }))
    }),
    Headers:joi.object({
        token:joi.string().required()
    }).options({allowUnknown:true})
}