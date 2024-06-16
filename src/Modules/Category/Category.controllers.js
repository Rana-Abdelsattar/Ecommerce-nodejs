import Category from "../../../DB/models/category.model.js";
import SubCategory from '../../../DB/models/sub-category.model.js'
import Brand from '../../../DB/models/brand.model.js'
import Product from '../../../DB/models/product.model.js'
import slugify from "slugify";

import cloudinaryConnection from'../../Utils/cloudinary.js'
import generateUniqueString from "../../Utils/generate-unique-string.js";
import { APIFeatures } from "../../Utils/APIFeatures.js";



// ======================== 1- Add Category api=====================
export const addCategory=async(req,res,next)=>{
  const{name}=req.body;

  const{_id}=req.authUser;

//  check if category name already exists 
const isCategoryNameExists=await Category.findOne({name})
if(isCategoryNameExists) return next(new Error('Category name already exists'),{cause:409})

// generate slug 
const slug=slugify(name,'-')

if(!req.file) return next(new Error('file is required'))

//generate folderName that saved in folderId field

const folderId= name + '-' + generateUniqueString(4)

const{secure_url,public_id}= await cloudinaryConnection().uploader.upload(req.file.path,{
    folder:`${process.env.MAIN_FILE}/Categories/${folderId}`
})

// send folder to next middleWare(rollbackMiddleware) in req if there is unexpected error happened after uploading 
//this rollback middleware delete the uploaded files 
req.folder=`${process.env.MAIN_FILE}/Categories/${folderId}`



// create object of category fields

const categoryObject={
    name,
    slug,
    Image:{secure_url,public_id},
    folderId,
    AddedBy:_id
}

// create new category
const newCategory=await Category.create(categoryObject)
// send savedDocument to next rollbackmiddleware if there is unexpected error happened after save document
//rollbacksavedocumentmiddleware delete saved document
 req.savedDocument={model:Category,_id:newCategory._id}

if(!newCategory) return next(new Error('could not create category'))

res.status(201).json({
    success:true,
    message:"Category added successfully",
    data:newCategory
})

}
// ==========================update Category api====================

export const updateCategory=async(req,res,next)=>{
    // 1- destructing data from request of body
    const{name,oldPublicId}=req.body;
    // 2- destructing categoryId from params
    const{categoryId}=req.params;
    // 3-destructing userId from request authUser
    const{_id}=req.authUser

    // 4-check if category already exists
    const isCategoryExists=await Category.findById({_id:categoryId})
    if(!isCategoryExists) return next(new Error('Category not found'),{cause:404})

    // 5-if user want to update name
    if(name){

    //   5.1 check if the user enter the same old name
      if(isCategoryExists.name==name) return next(new Error('please enter diffrent name from existing one'),{cause:400}) 

        // 5.2 check if category name already exists
        const isCategoryNameEsists=await Category.findOne({name})
        if(isCategoryNameEsists) return next(new Error('Category name already exists'),{cause:409})
         
        // 5.3- update category name and category sulg
        isCategoryExists.name=name,
        isCategoryExists.slug=slugify(name,'-')

    }

    //6-if user wants to update category image
    if(oldPublicId){
     
        if(!req.file) return next(new Error('image is required'))

        const newPublicId=oldPublicId.split(`${isCategoryExists.folderId}/`)[1]

        const {secure_url}=await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:`${process.env.MAIN_FILE}/Categories/${isCategoryExists.folderId}`,
            public_id:newPublicId
        })
        isCategoryExists.Image.secure_url=secure_url
        req.folder=`${process.env.MAIN_FILE}/Categories/${isCategoryExists.folderId}`  //this line to send folder to next middlware
      
   
    } 
    // 7- set value to updatedBY field
    isCategoryExists.updatedBy=_id
    await isCategoryExists.save()
    res.status(201).json({
        success:true,
        message:"category updated successfully",
        date:isCategoryExists
    })
}
// ===============================get all categories with their subcategories and their brands================

export const getAllCategories=async(req,res,next)=>{

//nested populate
    const AllCategories=await Category.find().populate(
    [
        {
            path:'sub-categories',
            populate:[{
                path:'Brands'
            }]
        }
    ])

    res.status(201).json({
        success:true,
        message:"all Categories",
        data:AllCategories
    })
}

// ================================get all sub-categories for specific category
export const getAllSubCategoriesForSpecifiedcCategory=async(req,res,next)=>{

    const{categoryId}=req.params
    const subCategories=await Category.findById(categoryId).populate(
        [
            {
                path:'sub-categories'
            }
        ]
    )
    res.status(200).json({
        message:"all sub-categories for specified category",
       data: subCategories
    })
}
// =================================get category by Id============================

export const getCategoryById=async(req,res,next)=>{
    const{categoryId}=req.params;

    const category=await Category.findById(categoryId);
    if(!category) return next(new Error('This Category not found'))

    res.status(200).json({message:'Done',category})
}
// =================================delete category whith its subcategories and brands

export const deleteCategory=async(req,res,next)=>{

    // destruct categoryId from request params
    const{categoryId}=req.params
   
    // delete category
    const category=await Category.findByIdAndDelete(categoryId)
    if(!category) return next(new Error('Category not found'))


    // delete all subcategories related to this category
   const categories=await SubCategory.deleteMany({categoryId})
   if(categories.deletedCount <=0)
   {
    console.log('there is no related subcategory to this category')
   }

    // delete all brands related to this category 
    const brands=await Brand.deleteMany({categoryId})
    if(brands.deletedCount <=0)
    {
    console.log('there is no related brands to this category')

    }
    
    //delete all products related to this category
    const products=await Product.deleteMany({categoryId})
    if(products.deletedCount <=0)
    {
        console.log('there is no related products to this category') 
    }
    // delete folder from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FILE}/Categories/${category.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FILE}/Categories/${category.folderId}`)

    res.status(201).json({
        success:true,
        message:'category deleted successfully',

    })


}

// =========================get all category with paginations=================================

export const getAllCategoriesWithPagination=async(req,res,next)=>{

    const{page,size}=req.query;

    const features=new APIFeatures(req.query,Category.find()).pagination({page,size})

   const categories=await features.mongooseQuery

   res.status(200).json({success:true,data:categories})

}

// =============================sort categories====================================

export const sortCategoies=async(req,res,next)=>{
    const{sort}=req.query

    const features=new APIFeatures(req.query,Category.find()).sortFunction(sort)

    const categories=await features.mongooseQuery

   res.status(200).json({success:true,data:categories})

}

// ===============================search in categories======================================

export const searchInCategories=async(req,res,next)=>{
    const{...search}=req.query

    const features=new APIFeatures(req.query,Category.find()).searchFunction(search)

    const categories=await features.mongooseQuery

   res.status(200).json({success:true,data:categories})

}