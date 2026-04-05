import Booking from "../../models/bookingModel.js";
import Service from "../../models/serviceModel.js";
import User from "../../models/userModel.js";
import Address from "../../models/addressModel.js";

export const createBooking = async (req, res) => {
    try {
        const { userId, serviceProviderId, serviceId, bookingDate, startTime, addressId, notes, paymentMethod = "COD" } = req.body;

        if (!userId || !serviceId || !bookingDate || !startTime || !addressId) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        // Validate user and service
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        const address = await Address.findOne({ _id: addressId, userId });
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found or doesn't belong to the user" });
        }

        const booking = new Booking({
            userId,
            serviceProviderId: serviceProviderId || null,
            serviceId,
            bookingDate: new Date(bookingDate),
            startTime,
            addressId,
            notes,
            priceDetails: {
                servicePrice: service.regularPrice,
                discount: service.regularPrice - service.salePrice,
                finalAmount: service.salePrice
            },
            paymentDetails: {
                method: paymentMethod,
                status: "PENDING"
            },
            status: serviceProviderId ? "ACCEPTED" : "PENDING",
            jobSource: "ADMIN_PANEL"
        });

        await booking.save();

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, search } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(query)
            .populate("userId", "name phone email")
            .populate("serviceProviderId", "name phone")
            .populate("serviceId", "name")
            .populate("addressId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("userId")
            .populate("serviceProviderId")
            .populate("serviceId")
            .populate("addressId")
            .populate("couponId");

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        return res.status(200).json({ success: true, data: booking });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Add validation for status transitions if needed
        booking.status = status;
        
        if (status === "COMPLETED") {
            // If it's COD, it's now paid when completed
            if (booking.paymentDetails.method === "COD") {
                booking.paymentDetails.status = "PAID";
                booking.paymentDetails.paidAt = new Date();
            }
        }

        await booking.save();

        return res.status(200).json({
            success: true,
            message: `Booking status updated to ${status}`,
            data: booking
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        return res.status(200).json({ success: true, message: "Booking deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
