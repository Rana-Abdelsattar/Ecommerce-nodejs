import {Router} from 'express'
import { authentication } from '../../middleWares/authentication.middleWare.js'
import systemRoles from '../../Utils/system-roles.js'
import expressAsyncHandler from 'express-async-handler'
import * as couponController from './coupon.controllers.js'
import validationMiddleWare from '../../middleWares/validation.middleWare.js'
import * as couponSchema from './coupon-validate-schema.js'


const router=Router()


router.post('/',authentication([systemRoles.ADMIN,systemRoles.SUPER_ADMIN]),
validationMiddleWare(couponSchema.addCouponSchema),
expressAsyncHandler(couponController.addCoupon))

router.get('/',authentication([systemRoles.ADMIN,systemRoles.SUPER_ADMIN]),
expressAsyncHandler(couponController.getAllCoupons))

router.get('/getCouponByCode',authentication([systemRoles.ADMIN,systemRoles.SUPER_ADMIN]),
expressAsyncHandler(couponController.getCouponByCode))


router.put('/',authentication([systemRoles.ADMIN,systemRoles.SUPER_ADMIN]),
validationMiddleWare(couponSchema.updateCouponSchema),
expressAsyncHandler(couponController.updateCoupon))



router.delete('/',authentication([systemRoles.ADMIN,systemRoles.SUPER_ADMIN]),
expressAsyncHandler(couponController.deleteCoupon))


router.post('/useCoupon',authentication([systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER]),
expressAsyncHandler(couponController.useCoupon))











export default router