
import joi from 'joi'
import { Types } from 'mongoose'

//custom validation

const objectIdValidation=(value,helper)=>{

    const isValid=Types.ObjectId.isValid(value)
    return(isValid ? value : helper.message('invalid id'))

}

//===========add subCategory schema
export const addSubCategorySchema={
    body:joi.object({
        name:joi.string().min(3).max(20).required()
    }),
    headers:joi.object({
        token:joi.string()
    }).options({allowUnknown:true}),
    params:joi.object({
        categoryId:joi.string().custom(objectIdValidation).required()
    }),
    file: joi.object({
        data: joi.binary(),
        name: joi.string(),
        size: joi.number().integer().min(1),
        mimeType: joi.string().valid('image/jpeg', 'image/png', 'image/gif','image/jpg','image/jfif')
      }).options({allowUnknown:true})
}

// ===============update subCategory Schema
export const updateSubCategorySchema={
    body:joi.object({
        name:joi.string().min(3).max(20),
        oldPublicId:joi.string()
    }),
    params:joi.object({
        subCategoryId:joi.string().custom(objectIdValidation)
    }),
    headers:joi.object({
        token:joi.string()
    }).options({allowUnknown:true}),
    file:joi.object({
        data:joi.binary(),
        name:joi.string(),
        size:joi.number().integer().min(1),
        mimeType:joi.string().valid('image/jpeg', 'image/png', 'image/gif','image/jpg','image/jfif')
    }).options({allowUnknown:true})
}


// ==================delete subCategory Schema
export const deleteSubCategorySchema={
    params:joi.object({
        subCategoryId:joi.string().custom(objectIdValidation).required()
    })
}

//=====================get sub category By Id
export const getSubCategoryByIdSchema={
    params:joi.object({
        subCategoryId:joi.string().custom(objectIdValidation).required()
    })
}