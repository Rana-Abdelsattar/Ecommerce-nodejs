import {Router} from 'express'
import { authentication } from '../../middleWares/authentication.middleWare.js';
import systemRoles from '../../Utils/system-roles.js';
import { multerMiddleWare } from '../../middleWares/multer.js';
import allowedExtensions from '../../Utils/allowed-extensions.js';
import expressAsyncHandler from 'express-async-handler';
import * as brandController from './brand.controllers.js'
import{addBrandSchema,updateBrandSchema,deleteBrandSchema} from './brand.validate-schema.js'
import validationMiddleWare from '../../middleWares/validation.middleWare.js'


const router=Router();

router.post('/',authentication([systemRoles.ADMIN]),
multerMiddleWare(allowedExtensions.IMAGE).single('image'),
validationMiddleWare(addBrandSchema),
expressAsyncHandler(brandController.addBrand))


router.put('/:brandId',
authentication([systemRoles.ADMIN]),
multerMiddleWare(allowedExtensions.IMAGE).single('image'),
validationMiddleWare(updateBrandSchema),
expressAsyncHandler(brandController.updateBrand))

router.delete('/:brandId',
authentication([systemRoles.ADMIN]),
validationMiddleWare(deleteBrandSchema),
expressAsyncHandler(brandController.deleteBrand))

router.get('/getAllBrandsForSpecificSubCategory/:subCategoryId',expressAsyncHandler(brandController.getAllBrandsForSpecificSubCategory))

router.get('/getAllBrandsForSpecificCategory/:categoryId',
expressAsyncHandler(brandController.getAllBrandsForSpecificCategory))

router.get('/getBrandsWithPagaination',
expressAsyncHandler(brandController.getBrandsWithPagaination))


router.get('/sortBrands',
expressAsyncHandler(brandController.sortBrands))

router.get('/searchInBrands',
expressAsyncHandler(brandController.searchInBrands))





export default router