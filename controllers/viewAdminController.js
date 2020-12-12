const multer = require("multer");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Products = require("../models/productModel");

exports.getLoginForm = async (req, res, next) => {
	res.status(200).render("admin/login", {
		pageTitle: "Login",
	});
};
exports.getHomePage = async (req, res, next) => {
	res.status(200).render("admin/homepage", {
		pageTitle: "Home",
	});
};
exports.getCategoryPage = catchAsync(async (req, res, next) => {
	const categories = await Category.find();
	res.status(200).render("admin/formcategory", {
		pageTitle: "Category",
		categories: categories,
	});
});

exports.getProductPage = catchAsync(async (req, res, next) => {
	const categories = await Category.find();

	const limit = 10;
	const page = +req.query.page * 1 || 1;
	const totalItems = await Products.find().countDocuments();
	const features = new APIFeatures(Products.find(), req.query)
		.filter()
		.sort("price")
		.limitFields()
		.paginate();
	const products = await features.query.populate("category");
	res.status(200).render("admin/formproduct", {
		pageTitle: "Product",
		products: products,
		categories: categories,
		results: products.length,
		index: 1,
		currentPage: page,
		hasNextPage: limit * page < totalItems,
		hasPreviousPage: page > 1,
		nextPage: page + 1,
		previousPage: page - 1,
		lastPage: Math.ceil(totalItems / limit),
	});
});
exports.deleteProduct = catchAsync(async (req, res, next) => {
	const product = await Products.findByIdAndDelete(req.params.id);

	if (!product) {
		return next(new AppError("No document found with that ID", 404));
	}
	res.redirect("/admin/product");
});


