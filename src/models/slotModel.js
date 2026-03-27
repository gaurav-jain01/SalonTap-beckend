import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    serviceProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
      index: true
    },

    date: {
      type: String, // "2026-03-27"
      required: true,
      index: true
    },

    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
      index: true
    },

    startTime: {
      type: String, // "10:00" (24h format)
      required: true
    },

    endTime: {
      type: String, // "11:00"
      required: true
    }
  },
  { timestamps: true }
);

// prevent duplicate slots
slotSchema.index(
  { serviceProviderId: 1, date: 1, startTime: 1 },
  { unique: true }
);

export default mongoose.model("Slot", slotSchema);