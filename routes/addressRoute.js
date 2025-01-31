// module.exports = router;
const express = require('express');
const router = express.Router();
const shippingAddressController = require('../controller/addressController');

// Create or Update Shipping Address
router.post('/shipping-address', shippingAddressController.createShippingAddress);
router.put('/update-shipping-address/:addressId', shippingAddressController.updateShippingAddress);
router.get('/getaddress/:userId', shippingAddressController.getAllShippingAddresses);
router.delete('/deleteaddress/:addressId', shippingAddressController.deleteAddress);
router.get('/getaddressbyaddressId/:addressId', shippingAddressController.getShippingAddressById);

module.exports = router;