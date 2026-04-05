import mongoose from "mongoose";

const vendorServiceSchema = new mongoose.Schema(
    {
        serviceProviderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceProvider",
            required: true,
            index: true
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
            index: true
        },
        rate: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { timestamps: true }
);

// Ensure a vendor can't add the same service twice
vendorServiceSchema.index({ serviceProviderId: 1, serviceId: 1 }, { unique: true });

export default mongoose.model("spServices", vendorServiceSchema);
