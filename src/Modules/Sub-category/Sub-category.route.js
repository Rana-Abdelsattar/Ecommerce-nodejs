import {Router} from 'express'
import expressAsyncHandler from 'express-async-handler'
import * as subCategoryControllers from './Sub-category.controllers.js'
import { authentication } from '../../middleWares/authentication.middleWare.js'
import systemRoles from '../../Utils/system-roles.js'
import { multerMiddleWare } from '../../middleWares/multer.js'
import allowedExtensions from '../../Utils/allowed-extensions.js'
import {addSubCategorySchema,updateSubCategorySchema,deleteSubCategorySchema,getSubCategoryByIdSchema} from './sub-category.validate-schema.js'
import validationMiddleWare from '../../middleWares/validation.middleWare.js'

const router=Router()

router.post('/:categoryId',
authentication([systemRoles.SUPER_ADMIN]),
multerMiddleWare(allowedExtensions.IMAGE).single('image'),
validationMiddleWare(addSubCategorySchema),
expressAsyncHandler(subCategoryControllers.addSubCategory))



router.put('/:subCategoryId',
authentication([systemRoles.SUPER_ADMIN]),
multerMiddleWare(allowedExtensions.IMAGE).single('image'),
validationMiddleWare(updateSubCategorySchema),
expressAsyncHandler(subCategoryControllers.updateSubCategory))


router.delete('/:subCategoryId',
authentication([systemRoles.SUPER_ADMIN]),
validationMiddleWare(deleteSubCategorySchema),
expressAsyncHandler(subCategoryControllers.deleteSubCategory))

router.get('/:subCategoryId',
validationMiddleWare(getSubCategoryByIdSchema),
expressAsyncHandler(subCategoryControllers.getSubCategoryById))


router.get('/withPaginations',expressAsyncHandler(subCategoryControllers.getAllSubCategoriesWithPagination))

router.get('/sortCategoies',expressAsyncHandler(subCategoryControllers.sortSubCategoies))

router.get('/searchInCategories',expressAsyncHandler(subCategoryControllers.searchInSubCategories))

export default router