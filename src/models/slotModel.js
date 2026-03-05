import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
    {
        serviceProvider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceProvider",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        startTime: {
            type: String, // e.g., "10:00 AM"
            required: true
        },
        endTime: {
            type: String, // e.g., "11:00 AM"
            required: true
        },
        isBooked: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model("Slot", slotSchema);
