import joi from 'joi'
import { Types } from 'mongoose'



//custom objectId Validation

const objectIdValidation=(value,helper)=>{
    const isValid=Types.ObjectId.isValid(value)
    return (isValid ? value : helper.message('invalid id'))
}


// =============add review validate schema

export const addReviewValidateSchema={
    body:joi.object({
        reviewRate:joi.number().min(1).max(5).required(),
        reviewComment:joi.string()
    }),
    headers:joi.object({
        token:joi.string()
    }).options({allowUnknown:true}),
    query:joi.object({
        productId:joi.string().custom(objectIdValidation).required()
    })
}
// =============delete review validate schema
export const deleteReviewValidateSchema={
    params:joi.object({
        reviewId:joi.string().custom(objectIdValidation).required()
    }),
    headers:joi.object({
        token:joi.string()
    }).options({allowUnknown:true})
}


// ==============getAllReviewsForSpecificProduct schema
export const getAllReviewsForSpecificProductSchema={
    params:joi.object({
        productId:joi.string().custom(objectIdValidation).required()
    }),
}