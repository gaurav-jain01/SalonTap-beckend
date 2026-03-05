import Cart from "../../models/cartModel.js";
import Service from "../../models/serviceModel.js";

const calculateTotals = async (cart) => {
    let regularTotal = 0;
    let saleTotal = 0;

    for (const item of cart.items) {
        // We populate the service to get current prices
        const service = await Service.findById(item.service);
        if (service) {
            regularTotal += service.regularPrice * item.quantity;
            saleTotal += service.salePrice * item.quantity;

            // Update snapshot price
            item.priceAtAdd = {
                regularPrice: service.regularPrice,
                salePrice: service.salePrice
            };
        }
    }

    cart.totalRegularPrice = regularTotal;
    cart.totalSalePrice = saleTotal;
};

export const addToCart = async (req, res) => {
    try {
        const { serviceId, quantity = 1 } = req.body;
        const userId = req.user._id;

        // 1. Check if service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        // 2. Find or create cart for user
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // 3. Check if service already in cart
        const itemIndex = cart.items.findIndex(item => item.service.toString() === serviceId);

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity += parseInt(quantity);
        } else {
            // Add new item
            cart.items.push({
                service: serviceId,
                quantity: parseInt(quantity),
                priceAtAdd: {
                    regularPrice: service.regularPrice,
                    salePrice: service.salePrice
                }
            });
        }

        // 4. Recalculate totals
        await calculateTotals(cart);
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item added to cart",
            data: cart
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        let cart = await Cart.findOne({ user: userId }).populate("items.service");

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: { items: [], totalRegularPrice: 0, totalSalePrice: 0 }
            });
        }

        // Optional: Recalculate totals on fetch to ensure prices are up to date
        await calculateTotals(cart);
        await cart.save();

        return res.status(200).json({
            success: true,
            data: cart
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item.service.toString() !== serviceId);

        await calculateTotals(cart);
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item removed from cart",
            data: cart
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId });

        if (cart) {
            cart.items = [];
            cart.totalRegularPrice = 0;
            cart.totalSalePrice = 0;
            await cart.save();
        }

        return res.status(200).json({
            success: true,
            message: "Cart cleared"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
