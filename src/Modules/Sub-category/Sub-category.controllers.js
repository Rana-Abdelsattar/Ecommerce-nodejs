import slugify from 'slugify';
import SubCategory from '../../../DB/models/sub-category.model.js'
import Category from '../../../DB/models/category.model.js'
import Brand from '../../../DB/models/brand.model.js'
import Product from '../../../DB/models/product.model.js'
import cloudinaryConnection from '../../Utils/cloudinary.js';
import generateUniqueString from '../../Utils/generate-unique-string.js';
import { APIFeatures } from '../../Utils/APIFeatures.js';



// ===============================add subCategory api
export const addSubCategory=async(req,res,next)=>{

// 1-desturct sub category name from request body
const{name}=req.body;

// 2-destruct added by from req.authuser
const{_id}=req.authUser;

// 3-destruct categoryId from params
const{categoryId}=req.params;

// 4-check if category exists
const isCategoryExists=await Category.findById({_id:categoryId})
if(!isCategoryExists) return next(new Error('Category not found'),{cause:404})


// 4- chech if sub category name already exists

const isNameExists=await SubCategory.findOne({name})
if(isNameExists) return next(new Error('sub category name already exists'),{cause:409})



// 5-- generate slug
const slug=slugify(name,'-')

// 6-upload image
if(!req.file) return next(new Error('Image is required'))

//generate folderName that saved in folderId
const folderId= name + '-' + generateUniqueString(4)

const{secure_url,public_id}=await cloudinaryConnection().uploader.upload(req.file.path,{
    folder:`${process.env.MAIN_FILE}/Categories/${isCategoryExists.folderId}/sub-Categories/${folderId}`
})

// send folder to next middleWare(rollbackMiddleware) in req if there is unexpected error happened after uploading 
//this rollback middleware delete the uploaded files 
req.folder=`${process.env.MAIN_FILE}/Categories/${isCategoryExists.folderId}/sub-Categories/${folderId}`

// 7-generate sub category object
const subCategoryObject={
    name,
    slug,
    Image:{secure_url,public_id},
    AddedBy:_id,
    folderId,
    categoryId
}

// 8- create new sub category
const newSubCategory=await SubCategory.create(subCategoryObject)
 
if(!newSubCategory) return next(new Error('Sub Category not created'))

// send savedDocument to next rollbackmiddleware if there is unexpected error happened after save document
//rollbacksavedocumentmiddleware delete saved document
req.savedDocument={model:SubCategory,_id:newSubCategory._id}

res.status(201).json({
    success:true,
    message:"Sub category created successfully",
    data:newSubCategory
})


}



// ===================================Update SubCategory

export const updateSubCategory=async(req,res,next)=>{

    //destruct new data from req.body
    const {name,oldPublicId}=req.body

    //destruct subCategoryId from req.params
    const {subCategoryId}=req.params

    //destruct userId from req.authUser
    const{_id}=req.authUser

    //check if subCategory already exists
    const subcategory=await SubCategory.findById({_id:subCategoryId})
    if(!subcategory) return next(new Error('subCategory not found'))

    //if super admin  want to update subactegory name

    if(name)
    {
        //check if he enter the same old name
        if(subcategory.name==name) return next(new Error('please enter diffrent name from existing one',{cause:400}))

        //check if new name is already exist for another subcategory

        const isNameExist=await SubCategory.findOne({name})
        if(isNameExist) return next(new Error('Duplicate Name'))

        //update name and slug

        subcategory.name=name;
        subcategory.slug=slugify(name,'-')
        
    }

  //if super admin wants to update image
  //using oldPublicId to override
  if(oldPublicId){
    if(!req.file) return next(new Error('image is required'))
  
    const newPublicId=oldPublicId.split(`${subcategory.folderId}`)[1]
    const newfolder=oldPublicId.split(`${subcategory.folderId}`)[0]

    const {secure_url}=await cloudinaryConnection().uploader.upload(req.file.path,{
        folder:newfolder,
        public_id:newPublicId
    })

      subcategory.Image.secure_url=secure_url
  }

  subcategory.updatedBy=_id

 await subcategory.save()

 res.status(200).json({success:true,message:'subCategory updated successfully',data:subcategory})

}


// ==========================delete subCategory
export const deleteSubCategory=async(req,res,next)=>{

    //destruct subcategoryId from req.params
    const{subCategoryId}=req.params
      
    //delete subcategory
    const subcategory=await SubCategory.findByIdAndDelete(subCategoryId)
     if(!subcategory) return next(new Error('subcategory not found'))

     //delete all brands related to this subcategory
     const brands=await Brand.deleteMany({subCategoryId})
     if(brands.deletedCount <=0)
     {
        console.log('there is no related brands to this subcategory')
     }

     //delete all products related to this subcategory
     const products=await Product.deleteMany({subCategoryId})
     if(products.deletedCount <= 0)
     {
        console.log('there is no related products to this subcategory')
     }

     //find category of this subcategory to help me in deleting subcategory folder in clodinary
     const category =await Category.findById({_id:subcategory.categoryId})
     //delete related folders and photos from cloudinary
     //ecommerce-project/Categories/Elctronic Devices-4s34/sub-Categories/Laptops-sgf4/z4nqpgtpouve2hod00hh
     await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FILE}/Categories/${category.folderId}/sub-Categories/${subcategory.folderId}`)
     await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FILE}/Categories/${category.folderId}/sub-Categories/${subcategory.folderId}`)


     res.status(200).json({sucess:true,message:'subcategory deleted successffuly'})
}

//  =================================get SubCategory by Id============================

export const getSubCategoryById=async(req,res,next)=>{
    const{subCategoryId}=req.params;

    const subcategory=await SubCategory.findById(subCategoryId);
    if(!subcategory) return next(new Error('This subCategory not found'))

    res.status(200).json({message:'Done',subcategory})
}


// =========================get all subcategory with paginations=================================

export const getAllSubCategoriesWithPagination=async(req,res,_)=>{

    const{page,size}=req.query;

    const features=new APIFeatures(req.query,SubCategory.find()).pagination({page,size})

   const subcategories=await features.mongooseQuery

   res.status(200).json({success:true,data:subcategories})

}

// =============================sort Subcategories====================================

export const sortSubCategoies=async(req,res,_)=>{
    const{sort}=req.query

    const features=new APIFeatures(req.query,SubCategory.find()).sortFunction(sort)

    const subcategories=await features.mongooseQuery

   res.status(200).json({success:true,data:subcategories})

}

// ===============================search in Subcategories======================================

export const searchInSubCategories=async(req,res,_)=>{
    const{...search}=req.query

    const features=new APIFeatures(req.query,SubCategory.find()).searchFunction(search)

    const subcategories=await features.mongooseQuery

   res.status(200).json({success:true,data:subcategories})

}