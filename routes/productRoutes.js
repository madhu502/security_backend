const router = require('express').Router();

const productController = require('../controller/productControllers');
const { authGuard, adminGuard } = require('../middleware/auth');


// create Category 
router.post('/create', authGuard, productController.createProduct);

// single product 
router.get('/get_single_product/:id', productController.getSingleProduct)


// fetch all products
router.get('/get_all_products', productController.getAllProducts)


//delete_product
router.delete('/delete_product/:id', productController.deleteProduct);


// update_product
router.put('/update_product/:id', productController.updateProduct);

// PaginationProducts
router.get('/pagination', productController.paginationProducts)

// Review Product
router.put('/:id/review', authGuard, productController.productReviewControllers)

module.exports = router 