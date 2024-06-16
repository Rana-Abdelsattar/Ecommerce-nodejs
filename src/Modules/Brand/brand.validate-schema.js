import joi from 'joi'
import { Types } from 'mongoose'



// custom validation
const objectIdValidation=(value,helper)=>{
    const isValid=Types.ObjectId.isValid(value)
    return (isValid ? value : helper.message('invalid Id'))
}

// ================add brand validate schema

export const addBrandSchema={
    body:joi.object({
        name:joi.string().min(3).max(20).required()
    }),
    query:joi.object({
        categoryId:joi.string().custom(objectIdValidation).required(),
        subCategoryId:joi.string().custom(objectIdValidation).required()
    }),
    headers:joi.object({
        token:joi.string()
    }).options({allowUnknown:true}),
    file:joi.object({
        data: joi.binary(),
        name: joi.string(),
        size: joi.number().integer().min(1),
        mimeType: joi.string().valid('image/jpeg', 'image/png', 'image/gif','image/jpg','image/jfif')
      }).options({allowUnknown:true})
}

// ================update Brand validate schema
export const updateBrandSchema={
    body:joi.object({
        name:joi.string().min(3).max(20),
        oldPublicId:joi.string()
    }),
    headers:joi.object({
        token:joi.string()
    }).options({allowUnknown:true}),
    params:joi.object({
        brandId:joi.string().custom(objectIdValidation).required()
    }),
    file:joi.object({
        data: joi.binary(),
        name: joi.string(),
        size: joi.number().integer().min(1),
        mimeType: joi.string().valid('image/jpeg', 'image/png', 'image/gif','image/jpg','image/jfif')
      }).options({allowUnknown:true})
}
// =============delete Brand validate schema

export const deleteBrandSchema={
    params:joi.object({
        brandId:joi.string().custom(objectIdValidation).required()
    })
}











