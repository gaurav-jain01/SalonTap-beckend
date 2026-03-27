import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    serviceProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
      index: true
    },

    // 🔹 Document Type (dynamic)
    type: {
      type: String,
      enum: ["aadhaar", "pan", "certificate"],
      required: true
    },

    // 🔹 File
    fileUrl: {
      type: String,
      required: true
    },

    // 🔹 Optional fields
    documentNumber: String,

    meta: {
      docType: String // e.g. Electricity Bill (future)
    },

    // 🔥 Verification
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },

    rejectionReason: String,

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },

    verifiedAt: Date
  },
  {
    timestamps: true
  }
);

// 🔥 Index for fast queries
documentSchema.index({ serviceProviderId: 1, type: 1 });

export default mongoose.model("Document", documentSchema);