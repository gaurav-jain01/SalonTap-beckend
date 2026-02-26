import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    balance: {
        available: { type: Number, default: 0 },
        hold: { type: Number, default: 0 },
    },
    currency: {
        type: String,
        default: "INR",
    },
    status: {
        type: String,
        enum: ["active", "inactive", "blocked", "suspended", "closed"],
        default: "active",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true });

walletSchema.virtual("totalBalance").get(function () {
    return this.balance.available + this.balance.hold;
});

// 🔹 Indexes
walletSchema.index({ userId: 1 });
walletSchema.index({ status: 1 });


export default mongoose.model("Wallet", walletSchema);