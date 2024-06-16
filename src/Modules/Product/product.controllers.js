
import Brand from '../../../DB/models/brand.model.js'
import Product from '../../../DB/models/product.model.js'
import cloudinaryConnection from '../../Utils/cloudinary.js'
import generateUniqueString from '../../Utils/generate-unique-string.js'
import systemRoles from '../../Utils/system-roles.js'
import slugify from 'slugify'
import { APIFeatures } from '../../Utils/APIFeatures.js'



// ======================Add product api===========================

export const addProduct = async (req, res, next) => {
    // data from the request body
    const { title, desc, basePrice, discount, stock, specs } = req.body
    // data from the request query
    const { categoryId, subCategoryId, brandId } = req.query
    // data from the request authUser
    const addedBy = req.authUser._id

    // brand check 
    const brand = await Brand.findById(brandId)
    if (!brand) return next({ cause: 404, message: 'Brand not found' })

    // category check
    if (brand.categoryId.toString() !== categoryId) return next({ cause: 400, message: 'Brand not found in this category' })
    // sub-category check
    if (brand.subCategoryId.toString() !== subCategoryId) return next({ cause: 400, message: 'Brand not found in this sub-category' })

    // who will be authorized to add a product
    if (
        req.authUser.role !== systemRoles.SUPER_ADMIN &&
        brand.AddedBy.toString() !== addedBy.toString()
    ) return next({ cause: 403, message: 'You are not authorized to add a product to this brand' })

    // generate the product  slug
    const slug = slugify(title, { lower: true, replacement: '-' })  //  lowercase: true

    //  applied price calculations
    const appliedPrice = basePrice - (basePrice * (discount || 0) / 100)

  

    //Images
    if (!req.files?.length) return next({ cause: 400, message: 'Images are required' })
    const Images = []
    const folderId =title + '-' + generateUniqueString(4)
    const folderPath = brand.Image.public_id.split(`${brand.folderId}/`)[0]

    for (const file of req.files) {
        // ecommerce-project/Categories/4aa3/SubCategories/fhgf/Brands/5asf/z2wgc418otdljbetyotn
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(file.path, {
            folder: folderPath + `${brand.folderId}/Products/${folderId}`
        })
        Images.push({ secure_url, public_id })
    }
    req.folder = folderPath + `${brand.folderId}/Products/${folderId}`


    // prepare the product object for db 
    const product = {
        title, desc, slug, basePrice, discount, appliedPrice, stock, specs:JSON.parse(specs), categoryId, subCategoryId, brandId, addedBy, Images, folderId
    }
      

    //send specs to next middleware
    req.specs=specs
    const newProduct = await Product.create(product)
    if(!newProduct) return next(new Error('product not saved'))
    req.savedDocument = { model: Product, _id: newProduct._id }

    res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct })
}


// ==============================update product===================================


export const updateProduct=async(req,res,next)=>{
    const{title, desc, basePrice, discount, stock, specs,oldPublicId}=req.body

    const {productId}=req.query;
    const{_id}=req.authUser;

    //check if product found
    const product=await Product.findById(productId);
    if(!product) return next(new Error('product not found'))

    //check who can update product
    if(product.addedBy.toString() !== _id.toString() &&
       req.authUser.role !== systemRoles.SUPER_ADMIN) return next(new Error('You are not authorized to add a product to this brand'))


       if(title) {
        product.title=title;
        const slug=slugify(title,{lower:true,replacement:'-'})
        product.slug=slug
       }

       if(desc) product.desc=desc;
       if(stock) product.stock=stock;
       if(specs) product.specs=JSON.parse(specs)
       
       const appliedPrice=(basePrice || product.basePrice) * ( 1- ((discount || product.discount)/100) )
       product.appliedPrice=appliedPrice

       if(basePrice) product.basePrice=basePrice
       if(discount) product.discount=discount    
       
       
    //    update image
    //ecommerce-project/Categories/Woman Fashion-fgf1/sub-Categories/clothes-35fg/brands/hoddi-d1hd/Products/short hoddies-5d1a/d2osbc24fymrlbvjehaw
    if(oldPublicId)
    {
        if(!req.file) return next(new Error('New Image is required'))

        const newPublicId=oldPublicId.split(`${product.folderId}/`)[1]

        console.log({newPublicId})
        console.log(oldPublicId.split(`${product.folderId}/`)[0]+product.folderId)

        const{secure_url}=await cloudinaryConnection().uploader.upload(req.file.path,{
            folder:oldPublicId.split(`${product.folderId}/`)[0]+product.folderId,
            public_id: newPublicId
        })
        product.Images.map((imag)=>{
            if(imag.public_id === oldPublicId) imag.secure_url=secure_url
        })
    }

    const updatedProduct= await product.save();

    res.status(201).json({
        success:true,
        message:"product updated successfully",
        data:updatedProduct
    })

}


// =================get All Products with (Pagination)===================

export const getAllProduct=async(req,res,next)=>{
    const{page,size,sort, ...search}=req.query;
      /*...search  rest Operator means 
      that search is an object contains any data comes from req.query instead of (page,size,sort)
      if user enter title in req.query it will be search.title,bascePrice > search.basePrice 
      */

   const newFeature=new APIFeatures(req.query,Product.find())
   .pagination({page,size})
 //  .sortFunction(sort)
//    .searchFunction(search)  //return this

   const products=await newFeature.mongooseQuery


    res.status(201).json({
        success:true,
        data:products
    })
}


export const sortProducts=async(req,res,next)=>{
    const{page,size,sort, ...search}=req.query;
    /*...search  rest Operator means 
    that search is an object contains any data comes from req.query instead of (page,size,sort)
    if user enter title in req.query it will be search.title,bascePrice > search.basePrice 
    */

 const newFeature=new APIFeatures(req.query,Product.find())
 //.pagination({page,size})
 .sortFunction(sort)
//  .searchFunction(search)  //return this

 const products=await newFeature.mongooseQuery


  res.status(201).json({
      success:true,
      data:products
  })
}


export const searchInProducts=async(req,res,next)=>{
    const{page,size,sort, ...search}=req.query;
    /*...search  rest Operator means 
    that search is an object contains any data comes from req.query instead of (page,size,sort)
    if user enter title in req.query it will be search.title,bascePrice > search.basePrice 
    */

 const newFeature=new APIFeatures(req.query,Product.find())
 //.pagination({page,size})
//  .sortFunction(sort)
 .searchFunction(search)  //return this

 const products=await newFeature.mongooseQuery


  res.status(201).json({
      success:true,
      data:products
  })
}

// =====================get All Products with its Reviews

export const getallProductsWithReviews=async(req,res,next)=>{
 
    const products=await Product.find().populate([{
        path:'Reviews'
    }])

    if(!products) return next(new Error('There are no Products'))

    res.status(201).json({
        success:true,
        message:"All products",
        data:products
    })


}