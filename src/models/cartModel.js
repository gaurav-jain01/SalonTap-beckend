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
                    min: 1,
                    max: 1
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
        },
        
        // Coupon Details
        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            default: null
        },
        couponCode: {
            type: String,
            default: ""
        },
        discountAmount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Totals are managed in the controller for efficiency
cartSchema.post("save", function (doc) {
    // Optional: add post-save logic if needed
});

export default mongoose.model("Cart", cartSchema);
