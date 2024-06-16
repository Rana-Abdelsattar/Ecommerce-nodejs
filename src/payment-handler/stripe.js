import Stripe from 'stripe';
import Coupon from '../../DB/models/coupon.model.js'

//create checkout session 
export const createCheckOutSession = async({
    customer_email,
    metadata,
    discounts,
    line_items
  

})=>{

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentData = await stripe.checkout.sessions.create({

        payment_method_types:['card'],
        mode:'payment',
        success_url:process.env.SUCCESS_URL,
        cancel_url:process.env.CANCEL_URL,
        customer_email,
        line_items,
        metadata,
        discounts
      });

      return paymentData

}
/* line_items:[{
      price-data:{
        currency:'usd,
        product_data:{
            name:'t-shirt
        },
        unit_amount:2000
      },
      quantity:1
}]*/


// create coupon object for stripe
export const createStripeCoupon = async({couponId})=>{

    //check if coupon exists in db
   const coupon=await Coupon.findById(couponId)
   if(!coupon) return next(new Error('coupon not found'))

   let couponObject={}

   if(coupon.isFixed){
      couponObject={
        name:coupon.couponCode,
        amount_off:coupon.couponAmount *100,
        currency:'EGP'
      }
   }
   

   if(coupon.isPercentage){
    couponObject={
        name:coupon.couponCode,
        percent_off:coupon.couponAmount,
      }
   }
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 
const stripeCoupon = await stripe.coupons.create(couponObject)


return stripeCoupon

}
// create payment Method
export const createPaymentMethods=async({token})=>{

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 
  
const paymentMethod = await stripe.paymentMethods.create({
  type: 'card',
  card: {
   token
  },
});
return paymentMethod
}

// create a stripe payment Intent

export const createPaymentIntent=async({amount,currency})=>{
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 

  const paymentMethod=await createPaymentMethods({token:'tok_visa'})
  const paymentIntent = await stripe.paymentIntents.create({
    amount:amount *100,
    currency,
    automatic_payment_methods:{
      enabled:true,
      allow_redirects:'never'
    },
    payment_method:paymentMethod.id
  })
  return paymentIntent

  }
// retrieve stipe payment intent
export const retrievePaymentIntent=async({paymentIntentID})=>{
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 
const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID);

return paymentIntent
}

//confirm payment intent
export const confirmPaymentIntent=async({paymentIntentId})=>{
 const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 

 const paymentDetails=await retrievePaymentIntent({paymentIntentId})
const paymentIntent = await stripe.paymentIntents.confirm(
  paymentIntentId,
  {
    payment_method: paymentDetails.payment_method
  }
);
return paymentIntent
}