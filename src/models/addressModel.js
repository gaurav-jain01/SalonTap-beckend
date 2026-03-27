import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    // 🔹 Ownership
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    serviceProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      default: null,
      index: true
    },

    // 🔹 Google Location Data
    main_text: {
      type: String,
      required: true,
      trim: true
    },
    secondary_text: {
      type: String,
      required: true,
      trim: true
    },
    place_id: {
      type: String,
      default: ""
    },

    // 🔥 GEO LOCATION
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        validate: {
          validator: function (val) {
            return (
              val.length === 2 &&
              val[0] >= -180 && val[0] <= 180 &&
              val[1] >= -90 && val[1] <= 90
            );
          },
          message: "Invalid coordinates"
        }
      }
    },

    // 🔹 Manual Details
    houseNumber: {
      type: String,
      default: "",
      trim: true
    },
    landmark: {
      type: String,
      default: "",
      trim: true
    },
    label: {
      type: String,
      enum: ["home", "office", "shop", "other"],
      default: "other",
      lowercase: true,
      trim: true
    },

    description: {
      type: String,
      default: "",
      trim: true
    },

    isLocationsFilled: {
      type: Boolean,
      default: true
    },

    // 🔹 Optional
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// 🔥 Ensure only one owner
addressSchema.pre("save", async function () {
  if (!this.user && !this.serviceProvider) {
    throw new Error("Either user or serviceProvider is required");
  }
  if (this.user && this.serviceProvider) {
    throw new Error("Only one should be set");
  }
});

// 🔥 Indexes
addressSchema.index({ location: "2dsphere" });
addressSchema.index({ serviceProvider: 1 });
addressSchema.index({ user: 1 });

const Address = mongoose.model("Address", addressSchema);

export default Address;