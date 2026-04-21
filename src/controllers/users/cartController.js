import Cart from "../../models/cartModel.js";
import Service from "../../models/serviceModel.js";
import Coupon from "../../models/couponModel.js";

// Helper function to calculate cart totals
const calculateTotals = (cart) => {
    let regularTotal = 0;
    let saleTotal = 0;

    cart.items.forEach(item => {
        const regularPrice = item.priceAtAdd?.regularPrice || 0;
        const salePrice = item.priceAtAdd?.salePrice || 0;
        regularTotal += regularPrice * (item.quantity || 1);
        saleTotal += salePrice * (item.quantity || 1);
    });

    cart.totalRegularPrice = regularTotal;
    cart.totalSalePrice = saleTotal;
};

// Helper function to validate and update coupon if applied
const validateCartCoupon = async (cart) => {
    if (!cart.couponId) return;

    const coupon = await Coupon.findById(cart.couponId);
    
    // Check if coupon is still valid and cart meeting minimum amount
    if (!coupon || !coupon.isActive || (coupon.minOrderAmount && cart.totalSalePrice < coupon.minOrderAmount)) {
        cart.couponId = null;
        cart.couponCode = "";
        cart.discountAmount = 0;
    } else {
        // Recalculate discount in case total sale price changed
        let discount = 0;
        if (coupon.discountType === "PERCENT") {
            discount = (cart.totalSalePrice * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }
        cart.discountAmount = discount;
    }
};

export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate("items.service");
        
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        const cartData = cart.toObject();
        cartData.total = cartData.totalSalePrice - (cartData.discountAmount || 0);

        console.log("FETCHED CART:", JSON.stringify(cartData, null, 2));
        return res.status(200).json({ success: true, data: cartData });
    } catch (error) {
        console.error("GET CART ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { serviceId, quantity = 1 } = req.body;
        const userId = req.user._id;

        if (!serviceId) {
            return res.status(400).json({ success: false, message: "Service ID is required" });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.service.toString() === serviceId);

        if (existingItemIndex > -1) {
            return res.status(400).json({ 
                success: false, 
                message: "This service is already in your cart. Only one quantity per service is allowed." 
            });
        } else {
            cart.items.push({
                service: serviceId,
                quantity: 1, // Enforce quantity 1
                priceAtAdd: {
                    regularPrice: service.regularPrice,
                    salePrice: service.salePrice
                }
            });
        }
        calculateTotals(cart);
        await validateCartCoupon(cart);
        await cart.save();

        const populatedCart = await cart.populate("items.service");
        const cartData = populatedCart.toObject();
        cartData.total = cartData.totalSalePrice - (cartData.discountAmount || 0);

        console.log("CART RESPONSE:", JSON.stringify(cartData, null, 2));
        return res.status(200).json({ success: true, message: "Item added to cart", data: cartData });

    } catch (error) {
        console.error("ADD TO CART ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const userId = req.user._id;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item.service.toString() !== serviceId);

        calculateTotals(cart);
        await validateCartCoupon(cart);
        await cart.save();

        const cartData = cart.toObject();
        cartData.total = cartData.totalSalePrice - (cartData.discountAmount || 0);

        return res.status(200).json({ success: true, message: "Item removed from cart", data: cartData });

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
            cart.couponId = null;
            cart.couponCode = "";
            cart.discountAmount = 0;
            await cart.save();
        }

        return res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
