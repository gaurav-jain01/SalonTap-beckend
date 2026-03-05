import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            required: true
        },

        description: {
            type: String
        },

        linkType: {
            type: String,
            enum: ["service", "external", "none"],
            default: "none"
        },

        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service"
        },

        externalLink: {
            type: String
        },

        order: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
