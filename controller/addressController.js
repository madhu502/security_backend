const ShippingAddress = require('../model/addressModel');
const User = require('../model/userModel'); // Assuming you have a User model

// Create a new Shipping Address
exports.createShippingAddress = async (req, res) => {
    const { userId, phoneNumber, city, address, landmark } = req.body;

    try {
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new shipping address
        const shippingAddress = new ShippingAddress({
            userId,
            phoneNumber,
            city,
            address,
            landmark
        });

        // Save the shipping address
        await shippingAddress.save();

        res.status(200).json({success:"true", message: 'Shipping address created successfully', shippingAddress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update an existing Shipping Address
exports.updateShippingAddress = async (req, res) => {
    const { addressId } = req.params;
    const { phoneNumber, city, address, landmark } = req.body;

    try {
        // Check if the address exists
        let shippingAddress = await ShippingAddress.findById(addressId);
        if (!shippingAddress) {
            return res.status(404).json({ message: 'Shipping address not found' });
        }

        // Update the existing shipping address
        shippingAddress.phoneNumber = phoneNumber;
        shippingAddress.city = city;
        shippingAddress.address = address;
        shippingAddress.landmark = landmark;

        // Save the shipping address
        await shippingAddress.save();

        res.status(200).json({
            success: "true",
            message: 'Shipping address updated successfully', 
            shippingAddress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all Shipping Addresses for a User
exports.getAllShippingAddresses = async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch all shipping addresses based on the user ID
        const shippingAddresses = await ShippingAddress.find({ userId }).populate('userId', 'fullname email username age phone');
        if (!shippingAddresses.length) {
            return res.status(404).json({ message: 'No shipping addresses found for this user' });
        }

        res.status(200).json({ success: true, addresses: shippingAddresses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Delete Address by ID
exports.deleteAddress = async (req, res) => {
    const { addressId } = req.params;

    try {
        // Check if the address exists
        const address = await ShippingAddress.findById(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Delete the address
        await ShippingAddress.findByIdAndDelete(addressId);

        res.status(200).json({succrss:"true", message: 'Address deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch Shipping Address by Address ID
exports.getShippingAddressById = async (req, res) => {
    const { addressId } = req.params;

    try {
        // Find the shipping address by ID
        const shippingAddress = await ShippingAddress.findById(addressId).populate('userId', 'firstname email lastname email phone');

        if (!shippingAddress) {
            return res.status(404).json({ message: 'Shipping address not found' });
        }

        res.status(200).json({ success: true, address: shippingAddress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
