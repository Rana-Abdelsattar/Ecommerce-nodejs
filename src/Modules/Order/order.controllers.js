import Order from '../../../DB/models/order.model.js'
import Product from '../../../DB/models/product.model.js'
import CouponUser from '../../../DB/models/coupon-users.model.js'
import Cart from '../../../DB/models/cart.model.js'
import { applyCouponValidation } from '../../Utils/apply-coupon.js';
import {DateTime} from 'luxon'
import { qrCodeGeneration } from '../../Utils/qr-code-generation.js';
import { confirmPaymentIntent, createCheckOutSession, createPaymentIntent, createStripeCoupon } from '../../payment-handler/stripe.js';



// ==============================create order api===============================order of one product
export const createOrder=async(req,res,next)=>{


    const{_id:user}=req.authUser;
    const{productId, quantity,couponCode, address, city,postalCode,  country,  phoneNumbers, paymentMethod}=req.body;

  //coupon check
  let coupon=null
  if(couponCode){
    const isCouponValid=await applyCouponValidation(couponCode,user)
    if(isCouponValid.status) return next(new Error(isCouponValid.msg),{cause:isCouponValid.status})
   coupon=isCouponValid;
  }
//product check
const product= await Product.findById(productId)
if(!product || product.stock < quantity) return next(new Error('product is not available'),{cause:400})

let orderItems=[{
    productId,
    title:product.title,
    price:product.appliedPrice,
    quantity
}]

//shipping price and totalPrice calculations
let shippingPrice=orderItems[0].price * quantity
let totalPrice=shippingPrice

if(couponCode){
    if(coupon?.isFixed)
    {
        if(shippingPrice < coupon?.couponAmount ) return next(new Error("you can not use this coupon"))
        totalPrice = shippingPrice - coupon.couponAmount
    }else if(coupon?.isPercentage){
        totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount/100)
    }

    await CouponUser.updateOne({couponId:coupon._id,userId:user},{$inc:{usageCount:1}})
}



// orderStatus + paymentMethod
let orderStatus;
if(paymentMethod=='Cash')  orderStatus='Placed'

//create order 
const order= new Order({
  user,
  orderItems,
  couponId:coupon?._id,
  shippingAddress:{address, city,postalCode,  country},
  phoneNumbers, 
  shippingPrice,
  totalPrice,
  paymentMethod,
  orderStatus
})

await order.save()

product.stock -= quantity
await product.save()


//generate QR Code
const QRCode=await qrCodeGeneration({orderId:order._id,orderPrice:order.totalPrice,orderStatus:order.orderStatus})


res.status(201).json({message:'order created successfully',order,QRCode})
}


// =======================convert cart to order api=====================

export const convertCartToOrder=async(req,res,next)=>{

    const{_id:user}=req.authUser;
    const{couponCode, address, city,postalCode,  country,  phoneNumbers, paymentMethod}=req.body;

  //coupon check
  let coupon=null
  if(couponCode){
    const isCouponValid=await applyCouponValidation(couponCode,user)
    if(isCouponValid.status) return next(new Error(isCouponValid.msg),{cause:isCouponValid.status})
   coupon=isCouponValid;
  }
//check if cart exists
const userCart= await Cart.findOne({userId:user})
if(!userCart) return next(new Error(`You do'nt have a cart`))

const orderItems=userCart.products.map(product=>{
    return{
        productId:product.productId,
        title:product.title,
        price:product.basePrice,
        quantity:product.quantity
        }
})


//shipping price and totalPrice calculations
let shippingPrice=userCart.subTotal
let totalPrice=shippingPrice

if(couponCode){
    if(coupon?.isFixed)
    {
        if(shippingPrice < coupon?.couponAmount ) return next(new Error("you can not use this coupon"))
        totalPrice = shippingPrice - coupon.couponAmount
    }else if(coupon?.isPercentage){
        totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount/100)
    }

    await CouponUser.updateOne({couponId:coupon._id,userId:user},{$inc:{usageCount:1}})
}



// orderStatus + paymentMethod
let orderStatus;
if(paymentMethod == 'Cash')  orderStatus='Placed'

//create order 
const order= new Order({
  user,
  orderItems,
  couponId:coupon?._id,
  shippingAddress:{address, city,postalCode,  country},
  phoneNumbers, 
  shippingPrice,
  totalPrice,
  paymentMethod,
  orderStatus
})

await order.save()

//delete cart
await Cart.findByIdAndDelete(userCart._id)

//decrease product stock
for (const product of order.orderItems ) {
    await Product.updateOne({_id:product.productId},{$inc:{stock:-product.quantity}})
    
}

res.status(201).json({message:'order created successfully',order})
}

// ======================deliever Order======================
export const delieverOrder=async(req,res,next)=>{
    const{_id:userId}=req.authUser;
    const{orderId}=req.params;

    const deliveredOrder=await Order.findOneAndUpdate({_id:orderId,orderStatus:{$in:['Placed','Paid']}},
    {orderStatus:'Delivered',
    isDeleivered:true,
    delieveredAt:DateTime.now().toFormat('yyyy-mm-dd hh:mm:ss'),
    deleivedBy:userId},
    {new:true})

    if(!deliveredOrder) return next(new Error('order not found '))

    res.status(201).json({
        message:"order delivered successfully",
        deliveredOrder

    })
   



}


// =========================payment wit stripe====================
export const payWithStripe=async(req,res,next)=>{
    const{orderId} =req.params
    const{_id:userId}=req.authUser

    const order = await Order.findOne({_id:orderId,user:userId , orderStatus:'Pending'})
    if(!order) return next(new Error('Order not found in payment'),{cause:404})


    //paymentData object
    const paymentData={
        customer_email:req.authUser.email,
        metadata:{orderId:order._id.toString()},
        discounts:[],
        line_items : order.orderItems.map((item)=>{
            return {
                price_data:{
                currency:'EGP',
                product_data:{
                    name:item.title
                },
                unit_amount:item.price * 100 //in cents
              },
              quantity:item.quantity
            }
        })
    }
   
  if(order.couponId)
  {
    const stripeCoupon=await createStripeCoupon({couponId:order.couponId})
   if(stripeCoupon.status) return next(new Error(stripeCoupon.message))

   paymentData.discounts.push({
    coupon:stripeCoupon.id
   })
  }

    const checkOutSession =await createCheckOutSession(paymentData)
      
    const paymentIntent= await createPaymentIntent({amount:order.totalPrice,currency:'EGP'})

    order.payment_intent=paymentIntent.id

    await order.save()
    res.json({checkOutSession, paymentIntent })
}

// ======================stripeWebhookLocal
export const stripeWebhookLocal=async(req,res,next)=>{

    
    const orderId=req.body.data.object.metadata.orderId
    const confirmedOrder=await Order.findByIdAndUpdate(orderId,{
          
       orderStatus:'Placed',
       isPaid:true,
       paidAt:DateTime.now().toFormat('yyyy-MM-DD HH:mm:ss')

    })

    const confirmedPaymentIntent=await confirmPaymentIntent({paymentIntentId:confirmedOrder.payment_intent})
    console.log(confirmedPaymentIntent)
    res.json({message:'webhook recieved'})
}