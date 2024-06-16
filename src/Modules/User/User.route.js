import {Router} from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as userControllers from './User.controllers.js'
import {authentication} from '../../middleWares/authentication.middleWare.js'
import systemRoles from '../../Utils/system-roles.js'
import validationMiddleWare from '../../middleWares/validation.middleWare.js'
import { changePasswordSchema, updateUserProfileSchema } from './user.validate-schema.js'

const router=Router()
router.use(authentication([systemRoles.ADMIN,systemRoles.USER])) // this line will be executed on all following routers 
router.put('/',validationMiddleWare(updateUserProfileSchema),expressAsyncHandler(userControllers.updateUserProfile))
router.delete('/deleteAccount',expressAsyncHandler(userControllers.deleteAcount))
router.patch('/changePassword',validationMiddleWare(changePasswordSchema),expressAsyncHandler(userControllers.changePassword))
router.get('/getUserData',expressAsyncHandler(userControllers.getUserData))

export default router