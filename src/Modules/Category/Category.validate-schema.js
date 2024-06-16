import joi from 'joi'
import { Types } from 'mongoose'

//custom validation
const objectIdValidation=(value,helper)=>{
    const isValid= Types.ObjectId.isValid(value)
    return (isValid ? value : helper.message('invalid id'))

}

// ==============================add Category validation schema

export const addCategorySchema={
    body:joi.object({
        name:joi.string().min(3).max(20).required()
    }),
    headers:joi.object({
        token:joi.string()
    }).options({allowUnknown:true}),
    file: joi.object({
        data: joi.binary(),
        name: joi.string(),
        size: joi.number().integer().min(1),
        mimeType: joi.string().valid('image/jpeg', 'image/png', 'image/gif','image/jpg','image/jfif')
      }).options({allowUnknown:true})
}

// =============================update category validation schema

export const updateCategoryShema={
    body:joi.object({
        name:joi.string().min(3).max(20),
        oldPublicId:joi.string()
    }),
    params:joi.object({
        categoryId:joi.string().custom(objectIdValidation).required()
    }),
    file: joi.object({
        data: joi.binary(),
        name: joi.string(),
        size: joi.number().integer().min(1),
        mimeType: joi.string().valid('image/jpeg', 'image/png', 'image/gif','image/jpg','image/jfif')
      }).options({allowUnknown:true}),

    headers:joi.object({
        token:joi.string().required()
    }).options({allowUnknown:true})
}


// =================================getAllSubCategoriesForSpecifiedcCategory schema
export const getAllSubCategoriesForSpecifiedcCategorySchema={
    params:joi.object({
        categoryId:joi.string().custom(objectIdValidation).required()
    })
}

// ===================================get category by id Schema
export const getCategoryByIdSchema={
    params:joi.object({
        categoryId:joi.string().custom(objectIdValidation).required()
    })
}
