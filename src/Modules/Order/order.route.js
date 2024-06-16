import {Router} from 'express'
import { authentication } from '../../middleWares/authentication.middleWare.js'
import systemRoles from '../../Utils/system-roles.js'
import expressAsyncHandler from 'express-async-handler'
import * as  orderController from './order.controllers.js'


const  router=Router()

router.post('/',authentication([systemRoles.USER]),
expressAsyncHandler(orderController.createOrder))

router.post('/cartToOrder',authentication([systemRoles.USER]),
expressAsyncHandler(orderController.convertCartToOrder))

router.put('/:orderId',authentication([systemRoles.DELIEVER]),
expressAsyncHandler(orderController.delieverOrder))

router.post('/payWithStripe/:orderId',authentication([systemRoles.USER]),
expressAsyncHandler(orderController.payWithStripe))


router.post('/webhooks',expressAsyncHandler(orderController.stripeWebhookLocal))


export default router