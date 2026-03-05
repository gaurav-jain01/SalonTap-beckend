import mongoose from "mongoose";

const serviceProviderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        salonName: {
            type: String,
            trim: true
        },
        profileImage: {
            type: String
        },
        experienceYears: {
            type: Number,
            default: 0
        },
        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address"
        },
        documents: {
            aadhaarCard: {
                url: String,
                number: String
            },
            panCard: {
                url: String,
                number: String
            },
            addressProof: {
                url: String,
                docType: String // e.g., "Electricity Bill", "Voter ID"
            }
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "suspended"],
            default: "pending"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// 🔹 Virtual for slots
serviceProviderSchema.virtual("slots", {
    ref: "Slot",
    localField: "_id",
    foreignField: "serviceProvider"
});

export default mongoose.model("ServiceProvider", serviceProviderSchema);
