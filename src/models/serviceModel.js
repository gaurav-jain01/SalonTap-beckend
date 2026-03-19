import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String
        },

        description: {
            type: String
        },

        regularPrice: {
            type: Number,
            required: true
        },

        salePrice: {
            type: Number,
            required: true
        },

        duration: {
            type: Number, // duration in minutes
            required: true
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory"
        },

        order: {
            type: Number,
            default: 0,
            index: true
        },


        gender: {
            type: String,
            enum: ["male", "female", "unisex"],
            default: "unisex"
        },
        isActive: {
            type: Boolean,
            default: true
        }

    },
    { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
