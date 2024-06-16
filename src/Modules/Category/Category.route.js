import {Router} from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as categoryController from './Category.controllers.js'
import { multerMiddleWare } from '../../middleWares/multer.js'
import allowedExtensions from '../../Utils/allowed-extensions.js'

import { authentication } from '../../middleWares/authentication.middleWare.js'
import systemRoles from '../../Utils/system-roles.js'
import validationMiddleWare from '../../middleWares/validation.middleWare.js'
import { addCategorySchema, updateCategoryShema ,getAllSubCategoriesForSpecifiedcCategorySchema, getCategoryByIdSchema} from './Category.validate-schema.js'




const router=Router()

router.post('/',authentication([systemRoles.SUPER_ADMIN]),
multerMiddleWare(allowedExtensions.IMAGE).single('image'),
validationMiddleWare(addCategorySchema),
expressAsyncHandler(categoryController.addCategory))

router.put('/:categoryId',authentication([systemRoles.SUPER_ADMIN]),
multerMiddleWare(allowedExtensions.IMAGE).single('image'),
validationMiddleWare(updateCategoryShema),
expressAsyncHandler(categoryController.updateCategory))


router.get('/allSUbCategories/:categoryId',
validationMiddleWare(getAllSubCategoriesForSpecifiedcCategorySchema),
expressAsyncHandler(categoryController.getAllSubCategoriesForSpecifiedcCategory))


router.get('/specifiedCategory/:categoryId',
validationMiddleWare(getCategoryByIdSchema),
expressAsyncHandler(categoryController.getCategoryById))

router.get('/',expressAsyncHandler(categoryController.getAllCategories))

router.get('/withPaginations',expressAsyncHandler(categoryController.getAllCategoriesWithPagination))

router.get('/sortCategoies',expressAsyncHandler(categoryController.sortCategoies))

router.get('/searchInCategories',expressAsyncHandler(categoryController.searchInCategories))



router.delete('/:categoryId',authentication([systemRoles.SUPER_ADMIN]),expressAsyncHandler(categoryController.deleteCategory))
export default router