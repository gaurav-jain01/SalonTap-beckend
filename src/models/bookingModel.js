import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        serviceProviderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceProvider",
            default: null
        },

        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },

        bookingDate: {
            type: Date,
            required: true,
            index: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String
        },

        addressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            required: true
        },

        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            default: null
        },

        priceDetails: {
            servicePrice: { type: Number, required: true },
            discount: { type: Number, default: 0 },
            finalAmount: { type: Number, required: true }
        },

        paymentDetails: {
            method: {
                type: String,
                enum: ["COD", "ONLINE"],
                default: "COD"
            },
            status: {
                type: String,
                enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
                default: "PENDING"
            },
            transactionId: String,
            paidAt: Date
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "ACCEPTED",
                "ON_THE_WAY",
                "IN_PROGRESS",
                "REJECTED",
                "CANCELLED",
                "COMPLETED"
            ],
            default: "PENDING",
            index: true
        },

        jobSource: {
            type: String,
            enum: ["USER_APP", "ADMIN_PANEL"],
            default: "USER_APP"
        },

        notes: String,

        cancellationReason: String,

        cancelledBy: {
            type: String,
            enum: ["USER", "ADMIN", "PROVIDER"]
        }

    },
    { timestamps: true }
);

bookingSchema.index({ bookingDate: 1, startTime: 1 });

export default mongoose.model("Booking", bookingSchema);


