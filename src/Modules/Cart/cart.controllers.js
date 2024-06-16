import Product from '../../../DB/models/product.model.js'

import Cart from '../../../DB/models/cart.model.js'





// =============================add product to cart or add new Cart then add product===========================

/*
1-destruct {productId, quantity} from request body
2-destruct userId from logggedIn user
3-check if product exists and if quantity of product is available
4-check if loggedIn user has acart
5-if he has a cart then
6-check if the product already in the cart
7-if it exists . then update quantity and final price
8-if not exists, then add product to cart
9-if there is no cart add a cart to db and add the product to cart
*/
export const addProductToCart=async(req,res,next)=>{
    const{quantity}=req.body
    const{productId}=req.params
    const{_id}=req.authUser

    // //check if product is exists
    // const product=await Product.findById(productId)
    // if(!product) return next(new Error('Product not found'))

    // //check if quantity is avaliable 
    // if(product.stock<quantity) return next(new Error('quantity of this product is not avaliable'))
    
    const product=await Product.findById(productId)
   

     if(!product) return next(new Error('product not found'))

     if(product.stock < quantity) return next(new Error('quantity of this product is not available'))
     

    
    // check if loggedIn user has a cart(if there is cart for this user)
    const UserCart=await Cart.findOne({userId:_id})
     
    // if he has'nt a cart,add cart to db
    if(!UserCart)
    {
       //add cart to user
       const cartObj={
        userId:_id,
        products:[
            {
                productId,
                quantity,
                basePrice:product.appliedPrice,
                title:product.title,
                finalPrice:product.appliedPrice * quantity

            }
        ],
        subTotal:product.appliedPrice*quantity
    }
         const newCart=  await Cart.create(cartObj)
           return res.status(201).json({success:true,message:'product added successfully',data:newCart})
    }

    // if user has a cart > check if product already in the cart 
    //if prodduct already exists ,update quantity,finalPrice 

   let isproductExist=false 
   await UserCart.products.map(async(prod)=>
    {
        if(prod.productId.toString() === productId) 
        {
           prod.quantity = quantity,
           prod.finalPrice = prod.basePrice * quantity
           isproductExist=true;
        }

    })
    //if product not exist in the cart,push it in products array
    if(!isproductExist){
         UserCart.products.push({
            productId,
            quantity,
            basePrice:product.appliedPrice,
            title:product.title,
            finalPrice:product.appliedPrice * quantity

        })
    }
      //update subTotal
      let subtotal=0;
      for (const prod of UserCart.products) {
          subtotal+=prod.finalPrice
      }
      UserCart.subTotal=subtotal
    await UserCart.save()

    res.status(201).json({
        sucess:true,
        message:"product added successfully",
        data:UserCart
    })
}

// ============================remove product from the cart================================

export const removeProductFromCart=async(req,res,next)=>{
    const{productId}=req.params;
    const{_id}=req.authUser


//check if cart exists and product already exists in it
const UserCart=await Cart.findOne({userId:_id,'products.productId':productId})

//'products.productId':productId => this means loop for (array of objects) array name=products,key in object = productId
if(!UserCart) return next(new Error('cart or product not found'))
//delete product from cart
UserCart.products=UserCart.products.filter(prod=>prod.productId.toString() !== productId)

let subtotal=0;
for (const prod of UserCart.products) {
    subtotal+=prod.finalPrice
    
}
UserCart.subTotal=subtotal
await UserCart.save()
if(UserCart.subTotal==0)
{
    await Cart.findByIdAndDelete(UserCart._id)
}

res.status(201).json({
    success:true,
    message:"product deleted from cart successfully"
})

}