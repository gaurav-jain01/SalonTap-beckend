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
            default: null,
            index: true
        },
        items: [
            {
                serviceId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Service",
                    required: true
                },

                name: { type: String, required: true },   // snapshot
                price: { type: Number, required: true },
                duration: { type: Number, required: true } // in minutes
            }
        ],
        itemType: {
            type: String,
            enum: ["service"], // future: "package"
            default: "service"
        },

        bookingDate: {
            type: Date,
            required: true,
            index: true
        },

        startTime: {
            type: Date,
            required: true
        },

        endTime: {
            type: Date
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
        couponCode: {
            type: String,
            default: ""
        },
        couponSnapshot: {
            type: {
                type: String
            },
            value: Number
        },
        priceDetails: {
            subtotal: { type: Number, required: true },
            basePrice: { type: Number, required: true },

            couponDiscount: { type: Number, default: 0 },
            extraDiscount: { type: Number, default: 0 },

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
bookingSchema.index({ serviceProviderId: 1, bookingDate: 1 });

bookingSchema.pre("save", function () {
    if (this.startTime && this.items?.length) {
        const totalDuration = this.items.reduce(
            (sum, item) => sum + (item.duration || 0),
            0
        );

        this.endTime = new Date(
            this.startTime.getTime() + totalDuration * 60000
        );
    }
});

export default mongoose.model("Booking", bookingSchema);


