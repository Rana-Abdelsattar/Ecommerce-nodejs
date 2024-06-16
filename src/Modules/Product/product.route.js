import {Router} from 'express'
import expressAsyncHandler from 'express-async-handler'
import * as productController from './product.controllers.js'
import { authentication } from '../../middleWares/authentication.middleWare.js'
// import validationMiddleWare from'../../middleWares/validation.middleWare.js'
// import {addProductValidateSchema} from './product.validate-schema.js'
import systemRoles from '../../Utils/system-roles.js'
import { multerMiddleWare } from '../../middleWares/multer.js'
import allowedExtensions from '../../Utils/allowed-extensions.js'


const router=Router()

router.post('/',
authentication([systemRoles.SUPER_ADMIN,systemRoles.ADMIN]),
multerMiddleWare(allowedExtensions.IMAGE).array('image',3),
// validationMiddleWare(addProductValidateSchema),
expressAsyncHandler(productController.addProduct))


router.put('/',
authentication([systemRoles.SUPER_ADMIN,systemRoles.ADMIN]),
multerMiddleWare(allowedExtensions.IMAGE).single('image'),
expressAsyncHandler(productController.updateProduct))

router.get('/getallProductsWithReviews',
expressAsyncHandler(productController.getallProductsWithReviews))

router.get('/getAllProducts',expressAsyncHandler(productController.getAllProduct))

router.get('/sortProducts',expressAsyncHandler(productController.sortProducts))

router.get('/searchInProducts',expressAsyncHandler(productController.searchInProducts))

export default router