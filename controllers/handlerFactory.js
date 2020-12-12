const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

//Delete Handle Factory
exports.deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(new AppError("No document found with that ID", 404));
		}

		res.status(204).json({
			status: "success",
			data: null,
		});
	});

//Update handle factory
exports.updateOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!doc) {
			return next(new AppError("No document found with that ID", 404));
		}

		res.status(200).json({
			status: "success",
			data: {
				data: doc,
			},
		});
	});

//Create One handle factory
exports.createOne = (Model) =>
	catchAsync(async (req, res, next) => {
		console.log(req.body);
		const doc = await Model.create(req.body);

		res.status(201).json({
			status: "success",
			data: {
				data: doc,
			},
		});
	});

//Get one handle factory
exports.getOne = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (popOptions) query = query.populate(popOptions);
		const doc = await query;

		if (!doc) {
			return next(new AppError("No document found with that ID", 404));
		}

		res.status(200).json({
			status: "success",
			data: {
				data: doc,
			},
		});
	});

//Get all handle factory
exports.getAll = (Model) =>
	catchAsync(async (req, res, next) => {
		// To allow for nested GET reviews on tour (hack)
		let filter = {};
		if (req.params.tourId) filter = { tour: req.params.tourId };

		const features = new APIFeatures(Model.find(filter), req.query)
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

//User must login to access resource
exports.protect = (Model) =>
	catchAsync(async (req, res, next) => {
		//1) getting token and check of it's there
		let token;
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
			console.log(token);
		} else if (req.cookies.jwt) {
			token = req.cookies.jwt;
		}

		if (!token) {
			return next(
				new AppError("You are not logged in! Please log in to get access.", 401)
			);
		}

		// 2) Verification token
		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

		// 3) Check if user still exists
		const currentUser = await Model.findById(decoded.id);
		if (!currentUser) {
			return next(
				new AppError(
					"The user belonging to this token does no longer exist.",
					401
				)
			);
		}

		// 4) Check if user changed password after the token was issued
		if (currentUser.changedPasswordAfter(decoded.iat)) {
			return next(
				new AppError(
					"User recently changed password! Please log in again.",
					401
				)
			);
		}

		// GRANT ACCESS TO PROTECTED ROUTE
		req.user = currentUser;
		res.locals.user = currentUser;
		next();
	});

//Only for rendered page, no errors!
