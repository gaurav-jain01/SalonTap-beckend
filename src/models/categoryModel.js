import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        slug: {
            type: String,
            lowercase: true,
            unique: true,
            index: true
        },

        image: {
            type: String
        },

        description: {
            type: String
        },

        order: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        },

        gender: {
            type: String,
            enum: ["men", "women", "unisex"],
            default: "unisex"
        }

    },
    { timestamps: true }
);

// 🔥 Auto-generate slug from name
categorySchema.pre("save", async function () {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");
    }
});

export default mongoose.model("Category", categorySchema);