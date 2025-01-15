const router = require('express').Router();
const categoryController = require('../controller/categoryControllers');

// create Category 
router.post('/create', categoryController.createCategory)

// delete Category
router.delete('/delete_category/:id', categoryController.deleteCategory)

// get all caterogy

router.get('/get_all_category', categoryController.getAllCaterogy)


router.get('/getcaterogybyid/:id', categoryController.getCategoryById);

module.exports = router 