const orderModel = require("../model/orderModel");

exports.addOrder = async (req, res) => {
    console.log(req.body);
    const { carts, address, total, paymentType, totalAmount } = req.body;

    try {
        const order = await orderModel({
            carts,
            address,
            total: total ?? totalAmount,
            paymentType,
            userId: req.user.id,
        });

        await order.save();

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate("carts")
            .populate("userId")
            .sort({ createdAt: -1, status: 1 });
        res.json({
            success: true,
            orders,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getUserOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ userId: req.user.id })
            .populate({
                path: 'carts',
                populate: {
                    path: 'productID',
                    model: 'products',
                },
            })
            .sort({ createdAt: -1 });

        console.log('Fetched Orders:', orders); // Debugging

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    try {
        const order = await orderModel.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await orderModel.findByIdAndUpdate(id, { status });

        res.status(200).json({ success: true, message: "Order status updated" });
    } catch (e) {
        res.status(500).json({ error: error.message });
    }
};