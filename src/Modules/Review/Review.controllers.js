import Product from '../../../DB/models/product.model.js'
import Order from '../../../DB/models/order.model.js'
   import Review from '../../../DB/models/Review.model.js'



// ===================add Review================

export const addReview=async(req,res,next)=>{
    const {_id}=req.authUser
    const{productId}=req.query
    const{reviewRate,reviewComment}=req.body

    //check if user already buy this product and allowed to review on it

const isUserAllowedToReview=await Order.findOne({
    user:_id,
    'orderItems.productId':productId,
    orderStatus:'Delivered'
})

if(!isUserAllowedToReview) return next(new Error('You must buy this product First'),{cause:400})

//create review Object

const reviewObject={
    userId:_id,
    productId,
    reviewRate,
    reviewComment
}

const review=await Review.create(reviewObject)

if(!review) return next(new Error('Review nor added successfully'),{cause:500})


//change product rate
const product=await Product.findById(productId)
const reviewes=await Review.find({productId})

 let sumOfRate=0
for (const review of reviewes) {
    sumOfRate+=review.reviewRate
    
}
product.rate= Number(sumOfRate / reviewes.length).toFixed(2)
await product.save()

res.status(201).json({success:true,message:'Review added Successfully',data:review})


  }


//   =======================delete Review====================
export const deleteReview=async(req,res,next)=>{
    const{_id}=req.authUser
    const{reviewId}=req.params

    const review=await Review.findOneAndDelete({_id:reviewId,userId:_id})
if(!review) return next(new Error('Review not deleted'))

res.status(201).json({
    success:true,
    message:'Review deleted successfully',
    data:review
})

}

// =======================get All Reviews for specific Product=======================
export const getAllReviewsForSpecificProduct=async(req,res,next)=>{
    const {productId}=req.params

    const reviews=await Review.find({productId})
if(reviews.length <=0) return next(new Error('There is no reviews on this product'))

res.status(201).json({success:true,message:'All Reviews',data:reviews})

}


