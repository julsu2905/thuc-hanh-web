const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Category = require("./../models/categoryModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");

const multerStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(`${__dirname}/public/img/categories`));
	},
	filename: (req, file, cb) => {
		console.log(req.file);
		cb(
			null,
			file.fieldname + "-" + Date.now() + path.extname(file.originalname)
		);
	},
});

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image")) {
		cb(null, true);
	} else {
		cb(new AppError("Not an image! Please upload only images.", 400), false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});
exports.uploadCategoryIcon = upload.single("categoryicon");


exports.resizeCategoryIcon = catchAsync(async (req, res, next) => {
	if (!req.file) return next();
	req.file.filename = `${req.file.filename}-${Date.now()}.jpeg`;
	await sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat("jpeg")
		.jpeg({ quality: 90 })
		.toFile(`public/img/categories/${req.file.filename}`);
	next();
});

//Create UserAdmin
exports.createCategory = factory.createOne(Category);

//Get All UserAdmin
exports.getAllCategories = factory.getAll(Category);
