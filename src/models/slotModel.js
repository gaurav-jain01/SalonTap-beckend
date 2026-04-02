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
      type: String,
      required: true,
      index: true
    },

    dayOfWeek: {
      type: Number, // 0-6 (Sun-Sat)
      required: true,
      min: 0,
      max: 6,
      index: true
    },

    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
      index: true
    },

    time: {
      type: String, // "10:00"
      required: true
    },

    isBooked: {
      type: Boolean,
      default: false
    },

    isBlocked: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// prevent duplicate slots
slotSchema.index(
  { serviceProviderId: 1, date: 1, time: 1, addressId: 1 },
  { unique: true }
);

export default mongoose.model("Slot", slotSchema);