import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Wallet",
        required: true,
    },
    direction: {
        type: String,
        enum: ["in", "out"],
        required: true,
    },
    category: {
        type: String,
        enum: ["wallet", "booking", "giftcard", "admin", "cashback"],
        required: true,
    },
    action: {
        type: String,
        enum: ["topup", "payment", "refund", "redeem", "adjustment", "cashback", "hold", "release"],
        required: true,
    },
    amount: {
        value: { type: Number, required: true },
        currency: { type: String, default: "INR" }
    },
    balanceSnapshot: {
        before: { type: Number },
        after: { type: Number },
    },
    reference: {
        id: { type: String },
        type: { type: String, enum: ["booking", "order", "giftcard", "wallet"], required: false }
    },
    status: {
        type: String,
        enum: ["completed", "pending", "failed", "hold"],
        required: true,
    },
    gateway: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },

    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },

    remark: {
        type: String,
        default: null
    }


}, { timestamps: true });


// Recommended indexes
transactionSchema.index({ userId: 1 });
transactionSchema.index({ walletId: 1 });
transactionSchema.index({ createdAt: -1 });

export default mongoose.model("Transaction", transactionSchema);