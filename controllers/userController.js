const multer = require("multer");
const sharp = require("sharp");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const path = require("path");

//upload photo

const multerStorage = multer.diskStorage({
	destination: (req, file, cb) => {
			cb(null, path.join(`${__dirname}/public/img/users`));
	},
	filename: (req, file, cb) => {
		console.log(req.body.id);
		cb(null, req.body.username + "-" + Date.now() + "-" + file.originalname);
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
 exports.uploadUserPhoto = upload.single('userphoto');

 exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
   const decoded = await promisify(jwt.verify)(
     req.cookies.jwt,
     process.env.JWT_SECRET
   );
   if (!req.file) return next();
   req.file.filename = `admin-${decoded.id}-${Date.now()}.jpeg`;
   await sharp(req.file.buffer)
     .resize(500, 500)
     .toFormat('jpeg')
     .jpeg({quality: 90})
     .toFile(`public/img/users/${req.file.filename}`);
   next();
 });

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
	const decoded = await promisify(jwt.verify)(
		req.cookies.jwt,
		process.env.JWT_SECRET
	);
	console.log(decoded);

	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				"This route is not for password updates. Please updateMyPassword",
				400
			)
		);
	}
	//2) Filterer out unwanted fields names that are not allowed to be updated
	const filteredBody = filterObj(req.body, "username", "email");
	console.log(req.files.photo);
	if (req.files.photo) filteredBody.photo = req.files.photo[0].filename;
	const updateUser = await User.findByIdAndUpdate(
		decoded.id,
		filteredBody,
		{
			new: true,
			runValidators: true,
		}
	);
	res.status(200).json({
		status: "success",
		data: {
			user: updateUser,
		},
	});
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	const decoded = await promisify(jwt.verify)(
		req.cookies.jwt,
		process.env.JWT_SECRET
	);

	await User.findByIdAndUpdate(decoded.id, { active: false });
	res.status(200).json({
		status: "success",
		data: null,
	});
});

//Update Password
exports.updatePasswordUserAdmin = catchAsync(async (req, res, next) => {
	const userAdmin = await User.findById(req.params.id).select("+password");

	if (!userAdmin) {
		return next(new AppError("No user found with that ID", 404));
	}
	userAdmin.password = req.body.password;
	userAdmin.passwordConfirm = req.body.passwordConfirm;
	await userAdmin.save({
		validateBeforeSave: true,
		runValidators: true,
	});
	res.status(201).json({
		status: "success",
		data: {
			data: userAdmin,
		},
	});
});

//Create UserAdmin
exports.createUser = factory.createOne(User);

//Get All UserAdmin
exports.getAllUsers = factory.getAll(User);
