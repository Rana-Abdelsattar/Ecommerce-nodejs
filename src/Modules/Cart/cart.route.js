import {Router}  from 'express'
import { authentication } from '../../middleWares/authentication.middleWare.js'
import systemRoles from '../../Utils/system-roles.js'
import expressAsyncHandler from 'express-async-handler'
import * as cartController from './cart.controllers.js' 


const router=Router()


router.post('/:productId',authentication([systemRoles.USER]),expressAsyncHandler(cartController.addProductToCart))
router.put('/:productId',authentication([systemRoles.USER]),expressAsyncHandler(cartController.removeProductFromCart))
export default router