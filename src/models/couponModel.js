import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    description: { type: String },

    discountType: {
        type: String,
        enum: ["PERCENT", "FLAT"]
    },

    discountValue: Number,
    maxDiscount: Number,

    minOrderAmount: Number,

    applicableServices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
    }],

    usageLimit: Number,
    usedCount: { type: Number, default: 0 },

    perUserLimit: { type: Number, default: 1 },

    validFrom: Date,
    validTill: Date,

    isActive: { type: Boolean, default: true }

}, { timestamps: true });


export default mongoose.model("Coupon", couponSchema);