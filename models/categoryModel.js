const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required : [true, "Category's name is required!"]
    },
    products :[{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Products'
    }],
    icon:String
});

const Categories = mongoose.model('Categories', categorySchema, 'categories');
module.exports = Categories;