const Cart = require('../model/cartModel');

const addToCart = async (req, res) => {
    const id = req.user.id;

    // destructure data 
    const {
        userID,
        productID,
        quantity,
    } = req.body;

    // validate the data 
    if (!userID || !productID) {
        return res.json({
            success: false,
            message: "Please, Login to add to cart"
        });
    }

    // try-catch block 
    try {
        const existingInCart = await Cart.findOne({
            userID: id,
            productID: productID,
            status: "active",
        });

        if (existingInCart) {
            //if the product already exists in the cart and the quantity is 1 then increment the quantity by 1
            // return Cart.findByIdAndUpdate(existingInCart._id, {
            //     $inc: { quantity: quantity }
            // }, { new: true });

            return res.json({
                success: false,
                message: "This item is already in cart"
            });
        }

        // Create a new cart entry
        const newCart = new Cart({
            userID: id,
            productID: productID,
            quantity: quantity,
            // quantity: parseInt(quantity, 10),


        });

        // Save the new cart
        await newCart.save();

        res.status(200).json({
            success: true,
            message: "Master piece added to cart successfully",
            data: newCart
        });

    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error");
    }
};

//get all items in the cart
const getCartByUserID = async (req, res) => {
    const id = req.user.id;
    try {
        const cart = await Cart.find({ userID: id }).populate('productID', 'productName productPrice productCategory productDescription productImage');
        res.json({
            message: "retrieved",
            success: true,
            cart: cart,
        });
    } catch (e) {
        res.json({
            message: "error",
            success: false,
        });
    }
};
const updateCart = async (req, res) => {
    try {
        const { id } = req.params; // Extract id from URL params
        let { quantity } = req.body; // Extract quantity from request body

        // Convert quantity to a number if it's provided as a string
        quantity = Number(quantity);
        console.log(typeof quantity);
        // Validate quantity here if needed
        if (isNaN(quantity) || quantity <= 0) {
            return res
                .status(400)
                .json({ error: "Quantity must be a valid number greater than zero" });
        }

        // Update the cart item based on id
        await Cart.findByIdAndUpdate(id, { quantity});

        // Respond with success message
        res.status(200).json({ message: "Item updated successfully" });
    } catch (error) {
        // Handle errors
        console.error("Error updating cart item:", error);
        res.status(500).json({ error: error.message });
    }
};


const removeFromCart = async (req, res) => {
    try {
        const removedFromCart = await Cart.findByIdAndDelete(req.params.id);
        if (!removedFromCart) {
            return res.json({
                success: false,
                message: "  product not found in cart!"
            })
        }
        res.json({
            success: true,
            message: " removed from cart successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }

}
const updateUserCartStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.body;
        if (!userId || !status) {
            return res.status(400).json({ error: "User ID and status are required" });
        }

        const cart = await Cart.updateMany({ userID: userId }, { status: status });
        console.log("updated cart",cart)
        res.status(201).json({ message: "Cart status updated successfully", cart :cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports = {
    addToCart,
    getCartByUserID,
    // getCart,
    updateCart,
    removeFromCart,
    updateUserCartStatus

};