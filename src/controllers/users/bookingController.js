import Booking from "../../models/bookingModel.js";
import Cart from "../../models/cartModel.js";
import Service from "../../models/serviceModel.js";

export const checkout = async (req, res) => {
    try {
        const userId = req.user._id;
        const { addressId, bookingDate, startTime, notes, paymentMethod = "COD" } = req.body;

        if (!addressId || !bookingDate || !startTime) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        // 1. Get user cart
        const cart = await Cart.findOne({ user: userId }).populate("items.service");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // 2. Create bookings for each service in cart? 
        // Or one booking with multiple services?
        // Current booking model only has one serviceId. 
        // So we create separate bookings if multiple services or we should have a different model?
        
        // Let's assume we create one booking per service item in cart for now, 
        // unless the user wants a multi-service booking.
        // Wait, bookingModel only has one serviceId.
        
        const bookings = [];

        for (const item of cart.items) {
            const booking = new Booking({
                userId,
                serviceId: item.service._id,
                bookingDate: new Date(bookingDate),
                startTime,
                addressId,
                notes,
                priceDetails: {
                    servicePrice: item.service.regularPrice,
                    discount: item.service.regularPrice - item.service.salePrice,
                    finalAmount: item.service.salePrice
                },
                paymentDetails: {
                    method: paymentMethod,
                    status: "PENDING"
                },
                status: "PENDING",
                jobSource: "USER_APP"
            });
            await booking.save();
            bookings.push(booking);
        }

        // 3. Clear cart
        cart.items = [];
        cart.totalRegularPrice = 0;
        cart.totalSalePrice = 0;
        await cart.save();

        return res.status(201).json({
            success: true,
            message: "Booking(s) created successfully",
            data: bookings
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user._id;
        const bookings = await Booking.find({ userId })
            .populate("serviceId")
            .populate("serviceProviderId", "name phone")
            .populate("addressId")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: bookings });
    } catch (error) {
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
