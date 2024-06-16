import joi from "joi";
import { Types } from "mongoose";
//custom objectId Validation

const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("invalid id");
};

// ==============add product validate schema
export const addProductValidateSchema = {
  body: joi.object({
    title:joi.string().min(3).max(20).required(),
    desc:joi.string().min(3),
    basePrice:joi.number().min(0).required(),
    discount:joi.number().min(0),
    stock:joi.number().min(0).required(),

    specs: joi.object().pattern(
        joi.string(),
        joi.array().items(joi.alternatives().try(joi.string(), joi.number()))
      )
 
  }),
  query:joi.object({
    categoryId:joi.string().custom(objectIdValidation).required(),
    subCategoryId:joi.string().custom(objectIdValidation).required(),
    brandId:joi.string().custom(objectIdValidation).required()
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
  
};

