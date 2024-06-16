import mongoose from "mongoose";


const orderSChema=new mongoose.Schema({
   
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    couponId:{type:mongoose.Schema.Types.ObjectId,ref:'Coupon'},
    orderItems:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        title:{type:String,required:true},
        quantity:{type:Number,required:true},
        price:{type:Number,required:true},
             }],

     shippingAddress:{
        address:{type:String,required:true},
        city:{type:String,required:true},
        postalCode:{type:String,required:true},
         country:{type:String,required:true}
     },         
    
     shippingPrice:{ type:Number, required:true}, // total price of orderItems array         
     totalPrice:{type:Number,required:true}, // shippingPrice - coupon if exist , if no coupon ,totalPrice=shippingPrice

  
    phoneNumbers:[{type:String,required:true}],
  
    
  

    paymentMethod:{type:String,enum:['Cash','Stripe','Paymob'],required:true},
    orderStatus:{type:String,enum:['Pending','Paid','Delivered','Placed','Canceled','Refund'],required:true,default:'Pending'},

    isPaid:{type:Boolean,required:true,default:false},
    paidAt:{type:String},

    isDeleivered:{type:Boolean,required:true,default:false},
    delieveredAt:{type:String},
    deleivedBy:{type:mongoose.Schema.Types.ObjectId,ref:'user'},

    cancelledAt:{type:String},
    cancelledBy:{type:mongoose.Schema.Types.ObjectId,ref:'user'},

    payment_intent:String

},{timestamps:true})


const Order=mongoose.model('Order',orderSChema)

export default mongoose.models.Order || Order