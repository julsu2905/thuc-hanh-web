const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const Categories = require("./categoryModel");

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Product's name is required!"],
		validate : {
			validator : (v) =>{
				return /^\w+\w+/.test(v);
			},
			message : "Product's name must have at least 2 characters"
		}
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Categories",
		required: [true, "Product must be in a category!"],
    },
    photo :String,
	price: Number,
	color: String,
});


const Products = mongoose.model("Products", productSchema, "products");
module.exports = Products;
