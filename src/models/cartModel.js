import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true // One cart per user
        },

        items: [
            {
                service: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Service",
                    required: true
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1
                },
                // Capture prices at the time of adding to cart (optional but helpful)
                priceAtAdd: {
                    regularPrice: Number,
                    salePrice: Number
                }
            }
        ],

        totalRegularPrice: {
            type: Number,
            default: 0
        },

        totalSalePrice: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// 🔹 Middleware to calculate totals before saving
cartSchema.pre("save", async function (next) {
    // This is just a backup; totals should ideally be managed in the controller for efficiency
    next();
});

export default mongoose.model("Cart", cartSchema);
