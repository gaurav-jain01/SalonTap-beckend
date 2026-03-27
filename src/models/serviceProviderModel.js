import mongoose from "mongoose";

const serviceProviderSchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
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

    // 🔹 Salon Info
    salonName: {
      type: String,
      trim: true
    },

    profileImage: {
      type: String,
    },

    experienceYears: {
      type: Number,
      default: 0
    },

    isBasicInfoFilled: {
      type: Boolean,
      default: false
    },

    isKYCSubmitted: {
      type: Boolean,
      default: false
    },

    isAddressFilled: {
      type: Boolean,
      default: false
    },

    isSlotsFilled: {
      type: Boolean,
      default: false
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 🔹 Virtual: Get all documents
serviceProviderSchema.virtual("documents", {
  ref: "Document",
  localField: "_id",
  foreignField: "serviceProviderId"
});

// 🔹 Virtual: Slots (your existing)
serviceProviderSchema.virtual("slots", {
  ref: "Slot",
  localField: "_id",
  foreignField: "serviceProviderId"
});

// 🔹 Virtual: Addresses
serviceProviderSchema.virtual("addresses", {
  ref: "Address",
  localField: "_id",
  foreignField: "serviceProvider"
});

export default mongoose.model("ServiceProvider", serviceProviderSchema);