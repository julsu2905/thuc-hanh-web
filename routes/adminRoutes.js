const app = require("express");
const router = app.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");

const { route } = require("./viewAdminRoutes");

router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.get("/me", userController.getMe);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

router
	.route("/")
	.get(userController.getAllUsers)
	.post(userController.createUser);

router
	.route("/products")
	.get(productController.getAllProducts)
	.post(productController.createProduct);

router
	.route("/categories")
	.get(categoryController.getAllCategories)
	.post(categoryController.createCategory);


module.exports = router;
