import mongoose, { Schema ,model} from "mongoose"




const cartSchema=new mongoose.Schema({

    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    products:[
        {
            productId:{
                type:Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            title:{
                type:String,
                required:true,
            },
            basePrice:{
                type:Number,
                required:true,
                default:0
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            },
            finalPrice:{     //quantity * basePrice
                type:Number,
                required:true
            }
        }
    ],
    subTotal:{      //totalPrice of the cart
        type:Number,
        required:true,
        default:0
    },



},{timestamps:true})

const Cart=model('Cart',cartSchema)

export default mongoose.models.Cart || Cart
