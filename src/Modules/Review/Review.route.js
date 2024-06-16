import {Router} from 'express'
import { authentication } from '../../middleWares/authentication.middleWare.js'
import * as ReviewController from'./Review.controllers.js'
import systemRoles from '../../Utils/system-roles.js'
import expressAsyncHandler from 'express-async-handler'
import validationMiddleWare from '../../middleWares/validation.middleWare.js'
import { addReviewValidateSchema, deleteReviewValidateSchema, getAllReviewsForSpecificProductSchema } from './Review.validate-schema.js'


const router=Router()



router.post('/',authentication([systemRoles.USER]),
validationMiddleWare(addReviewValidateSchema),
expressAsyncHandler(ReviewController.addReview))

router.delete('/:reviewId',
authentication([systemRoles.USER]),
validationMiddleWare(deleteReviewValidateSchema),
expressAsyncHandler(ReviewController.deleteReview))

router.get('/:productId',
authentication([systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN]),
validationMiddleWare(getAllReviewsForSpecificProductSchema),
expressAsyncHandler(ReviewController.getAllReviewsForSpecificProduct))



export default router




