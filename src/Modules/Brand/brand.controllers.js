import slugify from 'slugify';
import Brand from '../../../DB/models/brand.model.js'
import SubCategory from '../../../DB/models/sub-category.model.js'
import Product from '../../../DB/models/product.model.js'
import Category from '../../../DB/models/category.model.js'
import cloudinaryConnection from '../../Utils/cloudinary.js';
import generateUniqueString from '../../Utils/generate-unique-string.js';
import { APIFeatures } from '../../Utils/APIFeatures.js';


// =================== add brand api======================


export const addBrand=async(req,res,next)=>{

    // 1- destructing data from request body
           const{name}=req.body;

    // 2- destruct categoryId, subCategoryId from request params
      const{categoryId,subCategoryId}=req.query

    //   3-destruct addedBy from authUser
    const{_id}=req.authUser


    // 4- subcategory check
    const subcategory= await SubCategory.findById(subCategoryId).populate('categoryId','folderId')
    if(!subcategory) return next(new Error('SubCategory not found'))


    //  5- Duplicate Brand check
      const isBrandDuplicate=await Brand.findOne({name,subCategoryId})
      if(isBrandDuplicate) return next(new Error('Brand already exists for this subcategory'),{cause:404})


    // 6-   category check
     if(categoryId != subcategory.categoryId._id) return next(new Error('category not found'),{cause:404})

    // 7- generate slug
    const slug=slugify(name,'-');

    // 8-upload brand logo
    const folderId=name+'-'+generateUniqueString(4)
     if(!req.file) return next(new Error('image is required'),{cause:404})

     //i need category folderId to add it to the path of brand so i add populate to subcategory check to get category folderId
     const{secure_url,public_id}=await cloudinaryConnection().uploader.upload(req.file.path,{
        folder:`${process.env.MAIN_FILE}/Categories/${subcategory.categoryId.folderId}/sub-Categories/${subcategory.folderId}/brands/${folderId}`
     })

    //  create brand object
    const brandObject={
        name,
        slug,
        Image:{secure_url,public_id},
        categoryId,
        subCategoryId,
        AddedBy:_id,
        folderId

    }

    // create new brand 
    const newBrand=await Brand.create(brandObject)
    if(!newBrand) return next(new Error('could not create brand'))

    res.status(201).json({
        success:true,
        message:'Brand created successfully',
        data:newBrand
    })

}
//===========================update brand api=========================

export const updateBrand=async(req,res,next)=>{
    
  //destruct name from req.body
  const{name,oldPublicId}=req.body;

  //destruct adminId from authUser
  const{_id}=req.authUser
 
  //destruct brandId from req.params
  const{brandId}=req.params

  //check if brand exists and use populate to get category foldername and subcategory folder name 
  const brand=await Brand.findById(brandId).populate([
    {
      path:'categoryId',
      
    },
    {
      path:'subCategoryId'
    }
   
  ])
  
   console.log({categoryFolder:brand.categoryId.folderId,subcategoryFolder:brand.subCategoryId.folderId})

  if(!brand) return next(new Error('This Brand not found'))

  //if admin wants to update name
  if(name){

    //ckeck if he didn't enter same name
    if(brand.name == name) return next(new Error('please enter new name'))

    brand.name=name;
    brand.slug=slugify(name,'-')
  }

  //if admin want to update image

  if(oldPublicId)
  {
    if(!req.file) return next(new Error('image is required'))
    const newPublicId=oldPublicId.split(`${brand.folderId}/`)[1]
    //new image override old image
    const {secure_url}=await cloudinaryConnection().uploader.upload(req.file.path,{
      folder:`${process.env.MAIN_FILE}/Categories/${brand.categoryId.folderId}/sub-Categories/${brand.subCategoryId.folderId}/brands/${brand.folderId}`,
      public_id:newPublicId
    })

    brand.Image.secure_url=secure_url
    //this line to send folder to next middleware
    req.folder=`${process.env.MAIN_FILE}/Categories/${brand.categoryId.folderId}/sub-Categories/${brand.subCategoryId.folderId}/brands/${brand.folderId}`
  }

  // updated by logged admin now
  brand.updatedBy=_id

  //save in database
  await brand.save()

  res.status(200).json({
  sucess:true,
  message:' Brand updated successfully',
  data:brand
  })
  
}

// =====================================delete brand========================

export const deleteBrand = async(req,res,next)=>{

  //destruct brandId from params
  const {brandId}=req.params


  //get brand and its category and subcategory folderId to use it in deleting from cloudinary
  const brandData=await Brand.findById(brandId).populate([
    {
      path:'categoryId',
      
    },
    {
      path:'subCategoryId'
    }
   
  ])
  if(!brandData) return next(new Error(' This Brand not found'))

  
  
  
  //delete brand
  await Brand.findByIdAndDelete(brandId)

  
 //delete all products related to tis brand

 const products= await Product.deleteMany({brandId})
 if(products.deletedCount <=0)
 {
  console.log('there are no products related to this brand')
 }

 //delete brand folder and its products from cloudinary

 await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FILE}/Categories/${brandData.categoryId.folderId}/sub-Categories/${brandData.subCategoryId.folderId}/brands/${brandData.folderId}`)
 await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FILE}/Categories/${brandData.categoryId.folderId}/sub-Categories/${brandData.subCategoryId.folderId}/brands/${brandData.folderId}`)


 res.status(201).json({
  success:true,
  message:'brand deleted successfully',

})

}


// ====================get all brands for specific sub categories===============
export const getAllBrandsForSpecificSubCategory=async(req,res,next)=>{

  const {subCategoryId}=req.params

  //check subcategory
  const subcategory=await SubCategory.findById(subCategoryId)
  if(!subcategory) return next(new Error('subCategory not found'))

  const brands=await Brand.find({subCategoryId})
  if(!brands) return next(new Error('there is no brands for this subcategory'))


  res.status(201).json({
    success:true,
    message:'All Brands',
    data:brands
  })
}




// =========================get all brands for specific category================
export const getAllBrandsForSpecificCategory=async(req,res,next)=>{

  const{categoryId}=req.params

  //check if category exists in database
  const category= await Category.findById(categoryId)
if(!category) return next(new Error('category not found'))

  const brands=await Brand.find({categoryId})
  if(!brands) return next(new Error('there are no brands for this category'))

  res.status(201).json({
    success:true,
    message:'All Brands',
    data:brands
  })
}


// =====================get brands with pagination========================
export const getBrandsWithPagaination=async(req,res,next)=>{
 
  const{page,size}=req.query

  const features= new APIFeatures(req.query,Brand.find()).pagination({page,size})
  const brands=await features.mongooseQuery

res.status(200).json({
  success:true,
  message:'Brands',
  data:brands
})
}

// ======================sort Brands========================

export const sortBrands=async(req,res,next)=>{
 const{sort}=req.query

const features= new APIFeatures(req.query,Brand.find()).sortFunction(sort)
const brands=await features.mongooseQuery
 res.status(200).json({
  success:true,
  sortedBrands:brands
 })


}

// ========================search in Brands ByName or by slug==================
export const searchInBrands=async(req,res,next)=>{
   const{...search}=req.query

   const features=new APIFeatures(req.query,Brand.find()).searchFunction(search)
   const brands=await features.mongooseQuery
   res.status(200).json({
    success:true,
    sortedBrands:brands
   })
  

}
