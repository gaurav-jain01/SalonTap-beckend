import mongoose from "mongoose";
import Booking from "../../models/bookingModel.js";
import Cart from "../../models/cartModel.js";
import Service from "../../models/serviceModel.js";
import Coupon from "../../models/couponModel.js";

export const checkout = async (req, res) => {
    console.log("CHECKOUT REQUEST BODY:", JSON.stringify(req.body, null, 2));
    const session = await mongoose.startSession();

    try {
        const userId = req.user._id;
        const {
            addressId,
            bookingDate,
            startTime,
            notes,
            paymentMethod = "COD"
        } = req.body;

        if (!addressId || !bookingDate || !startTime) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing"
            });
        }

        if (paymentMethod !== "COD") {
            return res.status(400).json({
                success: false,
                message: "Only COD supported for now"
            });
        }

        await session.startTransaction();

        // 1. Get Cart
        const cart = await Cart.findOne({ user: userId })
            .populate("items.service")
            .session(session);

        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        // 2. Fetch fresh services (avoid stale cart data)
        const serviceIds = cart.items.map(i => i.service._id);

        const services = await Service.find({
            _id: { $in: serviceIds }
        }).session(session);

        // 3. Prepare items + calculate subtotal
        let subtotal = 0;

        const bookingItems = cart.items.map(item => {
            const service = services.find(s =>
                s._id.equals(item.service._id)
            );

            if (!service) {
                throw new Error("Service not found");
            }

            const price = service.salePrice || service.regularPrice;
            const quantity = item.quantity || 1;

            subtotal += price * quantity;

            return {
                serviceId: service._id,
                name: service.name,
                price,
                duration: service.duration,
                quantity
            };
        });

        // 4. Apply Coupon (revalidation)
        let couponDiscount = 0;
        let couponSnapshot = null;

        if (cart.couponId) {
            const coupon = await Coupon.findById(cart.couponId).session(session);

            if (!coupon) {
                throw new Error("Invalid coupon");
            }

            if (coupon.validTill && coupon.validTill < new Date()) {
                throw new Error("Coupon expired");
            }

            if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
                throw new Error(`Minimum order should be ${coupon.minOrderAmount}`);
            }

            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                throw new Error("Coupon usage limit reached");
            }

            // Calculate discount
            if (coupon.discountType === "PERCENT") {
                couponDiscount = (subtotal * coupon.discountValue) / 100;
            } else {
                couponDiscount = coupon.discountValue;
            }

            // Prevent over-discount
            if (couponDiscount > subtotal) {
                couponDiscount = subtotal;
            }

            // Snapshot for booking safety
            couponSnapshot = {
                type: coupon.discountType,
                value: coupon.discountValue
            };

            // (Optional) increment usage count
            coupon.usedCount += 1;
            await coupon.save({ session });
        }

        // 5. Final amount
        const finalAmount = subtotal - couponDiscount;

        // 6. Create Booking
        const booking = new Booking({
            userId,
            items: bookingItems,
            bookingDate: new Date(bookingDate),
            startTime: new Date(startTime),
            addressId,
            notes,

            couponId: cart.couponId,
            couponCode: cart.couponCode,
            couponSnapshot,

            priceDetails: {
                subtotal,
                basePrice: subtotal,
                couponDiscount,
                finalAmount
            },

            paymentDetails: {
                method: "COD",
                status: "PENDING"
            },

            status: "PENDING",
            jobSource: "USER_APP"
        });

        await booking.save({ session });

        // 7. Clear cart
        cart.items = [];
        cart.totalRegularPrice = 0;
        cart.totalSalePrice = 0;
        cart.couponId = null;
        cart.couponCode = "";
        cart.discountAmount = 0;

        await cart.save({ session });

        // 8. Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Booking placed successfully (COD)",
            data: booking
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("CHECKOUT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user._id;
        const bookings = await Booking.find({ userId })
            .populate("items.serviceId")
            .populate("serviceProviderId", "name")
            .sort({ createdAt: -1 });

        const transformedBookings = bookings.map(b => {
            const firstItemName = b.items[0]?.name || "Service";
            const title = b.items.length > 1
                ? `${firstItemName} +${b.items.length - 1} more`
                : firstItemName;

            const image = b.items[0]?.serviceId?.images?.[0] || "";

            return {
                _id: b._id,
                title,
                image,
                providerName: b.serviceProviderId?.name || "Not Assigned Yet",
                bookingDate: b.bookingDate ? b.bookingDate.toISOString().split("T")[0] : "",
                startTime: b.startTime ? b.startTime.toISOString().split("T")[1].substring(0, 5) : "",
                finalAmount: b.priceDetails?.finalAmount || 0,
                status: b.status
            };
        });

        return res.status(200).json({ success: true, data: transformedBookings });
    } catch (error) {
        console.error("GET MY BOOKINGS ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getBookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id })
            .populate("items.serviceId")
            .populate("serviceProviderId")
            .populate("addressId");

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const formattedBooking = {
            _id: booking._id,
            status: booking.status,
            bookingDate: booking.bookingDate ? booking.bookingDate.toISOString().split("T")[0] : "",
            startTime: booking.startTime ? booking.startTime.toISOString().split("T")[1].substring(0, 5) : "",
            endTime: booking.endTime ? booking.endTime.toISOString().split("T")[1].substring(0, 5) : "",

            services: booking.items.map(item => ({
                name: item.name,
                price: item.price,
                duration: item.duration,
                image: item.serviceId?.images?.[0] || ""
            })),

            provider: {
                name: booking.serviceProviderId?.name || "Not Assigned Yet"
            },

            address: {
                main: booking.addressId?.street || booking.addressId?.main || "",
                secondary: `${booking.addressId?.city || ""}, ${booking.addressId?.state || ""}`,
                houseNumber: booking.addressId?.houseNumber || "",
                landmark: booking.addressId?.landmark || ""
            },

            priceDetails: booking.priceDetails,

            coupon: {
                code: booking.couponCode || "",
                type: booking.couponSnapshot?.type || "",
                value: booking.couponSnapshot?.value || 0
            },

            payment: booking.paymentDetails,
            notes: booking.notes || "",
            createdAt: booking.createdAt ? booking.createdAt.toISOString().split("T")[0] : ""
        };

        return res.status(200).json({ success: true, data: formattedBooking });
    } catch (error) {
        console.error("GET BOOKING DETAILS ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (["COMPLETED", "REJECTED", "CANCELLED"].includes(booking.status)) {
            return res.status(400).json({ success: false, message: "Booking cannot be cancelled in its current state" });
        }

        booking.status = "CANCELLED";
        booking.cancelledBy = "USER";
        booking.cancellationReason = reason;
        await booking.save();

        return res.status(200).json({ success: true, message: "Booking cancelled successfully", data: booking });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;
        const userId = req.user._id;

        // 1. Find coupon
        const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid or expired coupon code" });
        }

        // 2. Check expiry
        const now = new Date();
        if (coupon.validTill && now > coupon.validTill) {
            return res.status(400).json({ success: false, message: "Coupon has expired" });
        }

        // 3. Get user cart to validate min amount
        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        if (coupon.minOrderAmount && cart.totalSalePrice < coupon.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`
            });
        }

        // 4. Calculate discount
        let discount = 0;
        if (coupon.discountType === "PERCENT") {
            discount = (cart.totalSalePrice * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }

        // 5. Save coupon details to cart
        cart.couponId = coupon._id;
        cart.couponCode = coupon.code;
        cart.discountAmount = discount;
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Coupon applied successfully",
            data: {
                couponId: coupon._id,
                code: coupon.code,
                discountAmount: discount,
                finalAmount: cart.totalSalePrice - discount
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAvailableCoupons = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Get user cart
        const cart = await Cart.findOne({ user: userId });
        const cartTotal = cart ? cart.totalSalePrice : 0;

        // 2. Get all active coupons
        const now = new Date();
        const coupons = await Coupon.find({
            isActive: true,
            validFrom: { $lte: now },
            validTill: { $gt: now }
        }).sort({ createdAt: -1 });

        // 3. Process coupons (mark as applicable or not)
        const availableCoupons = coupons.map(coupon => {
            const isApplicable = cartTotal >= (coupon.minOrderAmount || 0);

            // Calculate potential discount
            let potentialDiscount = 0;
            if (coupon.discountType === "PERCENT") {
                potentialDiscount = (cartTotal * coupon.discountValue) / 100;
                if (coupon.maxDiscount && potentialDiscount > coupon.maxDiscount) {
                    potentialDiscount = coupon.maxDiscount;
                }
            } else {
                potentialDiscount = coupon.discountValue;
            }

            return {
                ...coupon.toObject(),
                isApplicable,
                potentialDiscount,
                message: isApplicable
                    ? "Coupon can be applied"
                    : `Add ₹${coupon.minOrderAmount - cartTotal} more to use this coupon`
            };
        });

        return res.status(200).json({
            success: true,
            data: availableCoupons
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
