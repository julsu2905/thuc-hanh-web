const app = require('express');
const router = app.Router();
const viewClientController = require('../controllers/viewClientController');
const viewAdminController = require('../controllers/viewAdminController');
const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');

router.get('/',viewAdminController.getLoginForm);

router.route('/category')
.get(viewAdminController.getCategoryPage)
.post(categoryController.uploadCategoryIcon,categoryController.createCategory);


router.route('/product').get(viewAdminController.getProductPage).post(productController.createProduct);
router.get("/product", productController.searchProduct);
router.post('/product/delete/:id', viewAdminController.deleteProduct);

module.exports= router ;