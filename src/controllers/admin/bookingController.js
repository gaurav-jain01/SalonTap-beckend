import Booking from "../../models/bookingModel.js";
import Service from "../../models/serviceModel.js";
import User from "../../models/userModel.js";
import Address from "../../models/addressModel.js";
import cache from "../../utils/cache.js";

const clearBookingCache = () => {
    const keys = cache.keys();
    const bookingKeys = keys.filter(key => key.startsWith("bookings_"));
    if (bookingKeys.length > 0) {
        cache.del(bookingKeys);
    }
};

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
            items: [{
                serviceId: service._id,
                name: service.name,
                price: service.salePrice,
                duration: service.duration || 30 // default duration if missing
            }],
            bookingDate: new Date(bookingDate),
            startTime,
            addressId,
            notes,
            priceDetails: {
                subtotal: service.salePrice,
                basePrice: service.regularPrice,
                extraDiscount: 0,
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

        // 🔹 Clear Cache
        clearBookingCache();

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
        const { status, page = 1, limit = 10, search, userId, serviceProviderId } = req.query;

        // 🔹 Cache Key
        const cacheKey = `bookings_${status || "all"}_${page}_${limit}_${search || "none"}_${userId || "all"}_${serviceProviderId || "all"}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return res.status(200).json({
                success: true,
                data: cachedData.bookings,
                pagination: cachedData.pagination,
                fromCache: true
            });
        }

        const query = {};
        if (status) query.status = status;
        if (userId) query.userId = userId;
        if (serviceProviderId) query.serviceProviderId = serviceProviderId;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(query)
            .populate("userId", "name mobile email")
            .populate("serviceProviderId", "name mobile")
            .populate({
                path: "items.serviceId",
                select: "name price duration"
            })
            .populate("addressId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Booking.countDocuments(query);

        const responseData = {
            bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        };

        // 🔹 Set Cache (10 minutes)
        cache.set(cacheKey, responseData);

        return res.status(200).json({
            success: true,
            data: responseData.bookings,
            pagination: responseData.pagination
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("userId", "name mobile email")
            .populate("serviceProviderId", "name mobile")
            .populate({
                path: "items.serviceId"
            })
            .populate("addressId")
            .populate("couponId")
            .lean();

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

        // 🔹 Clear Cache
        clearBookingCache();

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

        // 🔹 Clear Cache
        clearBookingCache();

        return res.status(200).json({ success: true, message: "Booking deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



