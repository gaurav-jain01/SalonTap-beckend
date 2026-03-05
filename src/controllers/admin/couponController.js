import mongoose from "mongoose";
import Coupon from "../../models/couponModel.js";

export const createCoupon = async (req, res) => {
    try {
        const {
            code, description, discountType, discountValue,
            minOrderValue, maxDiscountAmount, startDate, expiryDate, usageLimit
        } = req.body;

        // 🔹 Basic Validation
        if (!code || !discountType || !discountValue || !startDate || !expiryDate) {
            return res.status(400).json({
                success: false,
                message: "Code, discount type, value, start date, and expiry date are required"
            });
        }

        // 🔹 Check for duplicate code
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: "Coupon code already exists"
            });
        }

        // 🔹 Create Coupon
        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            minOrderValue,
            maxDiscountAmount,
            startDate,
            expiryDate,
            usageLimit
        });

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            data: coupon
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCoupons = async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "Invalid coupon ID" });
            }
            const coupon = await Coupon.findById(id);
            if (!coupon) {
                return res.status(404).json({ success: false, message: "Coupon not found" });
            }
            return res.status(200).json({ success: true, data: coupon });
        }

        const {
            page = 1,
            limit = 10,
            search = "",
            status, // active, inactive, expired
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const filter = {};
        if (search) {
            filter.code = { $regex: search, $options: "i" };
        }

        const now = new Date();
        if (status === "active") {
            filter.isActive = true;
            filter.expiryDate = { $gt: now };
        } else if (status === "inactive") {
            filter.isActive = false;
        } else if (status === "expired") {
            filter.expiryDate = { $lt: now };
        }

        const coupons = await Coupon.find(filter)
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await Coupon.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: coupons
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid coupon ID" });
        }

        if (updates.code) {
            updates.code = updates.code.toUpperCase();
            // Check if another coupon has the same code
            const existing = await Coupon.findOne({ code: updates.code, _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({ success: false, message: "Coupon code already taken" });
            }
        }

        const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: coupon
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid coupon ID" });
        }

        const coupon = await Coupon.findByIdAndDelete(id);

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
