const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
    },
    categoryDescription: {
        type: String,
        required: true,
        maxLength: 500
    },
    categoryImage: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const Category = mongoose.model('category', CategorySchema)

module.exports = Category;