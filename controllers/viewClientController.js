const multer = require("multer");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const User = require('../models/userModel');
const Category = require("../models/categoryModel");

exports.getLandingPage = catchAsync(async (req, res, next) => {
    const categories = await Category.find().populate('products');
    const users = await User.find();
    res.status(200).render("client/landingpage", {
        pageTitle: "Smarthome",
        categories : categories,
        users : users
	});
});
