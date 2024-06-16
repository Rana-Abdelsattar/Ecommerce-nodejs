import { globalResponse } from "./middleWares/global-response.middleWare.js";
import DB_connection from "../DB/connection.js";
import authRouter from './Modules/Auth/Auth.route.js'
import userRouter from './Modules/User/User.route.js'
import categoryRouter from './Modules/Category/Category.route.js'
import SubCategoryRouter from './Modules/Sub-category/Sub-category.route.js'
import brandRouter from './Modules/Brand/brand.route.js'
import productRouter from './Modules/Product/product.route.js'
import cartRouter from './Modules/Cart/cart.route.js'
import couponRouter from './Modules/coupon/coupon.route.js'
import orderRouter from './Modules/Order/order.route.js'
import ReviewRouter from './Modules/Review/Review.route.js'
import { rollBackUploadedFiles } from "./middleWares/rollBack-uploaded-files.middleWare.js";
import { rollbackSavedDocuments } from "./middleWares/rollack-saved-documents.middleware.js";
import { cronToChangeCouponStatus } from "./Utils/cron.js";
import { gracefulShutdown } from "node-schedule";

const initiate=(app,express)=>{

    app.use(express.json());




    DB_connection()
    

    app.use('/auth',authRouter)
    app.use('/user',userRouter)
    app.use('/category',categoryRouter)
    app.use('/subCategory',SubCategoryRouter)
    app.use('/brand',brandRouter)
    app.use('/product',productRouter)
    app.use('/cart',cartRouter)
    app.use('/coupon',couponRouter)
    app.use('/order',orderRouter)
    app.use('/Review',ReviewRouter)


    app.use('*',(req,res,next)=>{res.json('invalid Routing')})


    // i put rollBackMiddleWare after global response because i don't need to execute it if there is no error
    app.use(globalResponse,rollBackUploadedFiles,rollbackSavedDocuments)

cronToChangeCouponStatus()
gracefulShutdown() // to stop crons 



   
    app.listen(process.env.PORT,()=>{console.log('server is running')})
   


}
export default initiate