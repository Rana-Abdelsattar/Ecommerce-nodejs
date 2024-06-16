import { Router } from "express";
import * as authController from './Auth.controllers.js'
import expressAsyncHandler from "express-async-handler";
import validationMiddleWare from "../../middleWares/validation.middleWare.js";
import { signUpSchema ,signInSchema, forgetPasswordSchema} from "./Auth.validate-schema.js";
const router=Router()


router.post('/',validationMiddleWare(signUpSchema),expressAsyncHandler(authController.signUp))
router.get('/verify-email',expressAsyncHandler(authController.verifyEmail))
router.post('/login',validationMiddleWare(signInSchema),expressAsyncHandler(authController.signIn))
router.post('/forgetPassword',validationMiddleWare(forgetPasswordSchema),expressAsyncHandler(authController.forgetPassword))

router.post('/resetPassword/:token',expressAsyncHandler(authController.resetPassword))

export default router