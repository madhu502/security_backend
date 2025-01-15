// models/ShippingAddress.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShippingAddressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('ShippingAddress', ShippingAddressSchema);