const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Product = require("./../models/productModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const Categories = require("../models/categoryModel");
const APIFeatures = require("../utils/apiFeatures");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");

const multerStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(`${__dirname}/public/img/products`));
	},
	filename: (req, file, cb) => {
		console.log(req.body.id);
		cb(
			null,
			file.fieldname + "-" + Date.now() + "-" + path.extname(file.originalname)
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
exports.uploadProductPhoto = upload.single("productphoto");

exports.resizeProductPhoto = catchAsync(async (req, res, next) => {
	if (!req.file) return next();
	req.file.filename = `${req.file.filename}-${Date.now()}.jpeg`;
	await sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat("jpeg")
		.jpeg({ quality: 90 })
		.toFile(`public/img/products/${req.file.filename}`);
	next();
});

//Create product
exports.createProduct = catchAsync(async (req, res, next) => {
	console.log(req.body);
	const doc = await Product.create(req.body);

	await Categories.findByIdAndUpdate(
		doc.category,
		{
			$push: { products: doc._id },
		},
		{ new: true }
	);

	res.status(201).json({
		status: "success",
		data: {
			data: doc,
		},
	});
});

//Get All products
exports.getAllProducts = catchAsync(async (req, res, next) => {
	// To allow for nested GET reviews on tour (hack)
	let filter = {};
	if (req.params.tourId) filter = { tour: req.params.tourId };

	const features = new APIFeatures(
		Product.find(filter).populate("category"),
		req.query
	)
		.filter()
		.sort()
		.limitFields()
		.paginate();
	// const doc = await features.query.explain();
	const doc = await features.query;

	// SEND RESPONSE
	res.status(200).json({
		status: "success",
		results: doc.length,
		data: {
			data: doc,
		},
	});
});
exports.searchProduct = catchAsync(async (req, res, next) => {
	// To allow for nested GET reviews on tour (hack)
	let filter = {};
	if (req.params.search) filter = { $or :[{'name' : req.params.search},{'category' :{'name' : req.params.search}},{'price' : req.params.search}, {'color' :req.params.search}]};
	console.log('test');
	const features = new APIFeatures(Products.find(filter).populate('category'), req.query)
		.filter()
		.sort()
		.limitFields()
		.paginate();
	// const doc = await features.query.explain();
	const doc = await features.query;
	if (!doc) return next(new AppError("No document found with that ID", 404));
	// SEND RESPONSE
	res.status(200).json({
		status: "success",
		results: doc.length,
		data: {
			data: doc,
		},
	});
});
