import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            lowercase: true,
            trim: true
        },

        images: [String],

        description: {
            type: String,
            trim: true
        },

        regularPrice: {
            type: Number,
            required: true,
            min: 0
        },

        salePrice: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: function (value) {
                    return value <= this.regularPrice;
                },
                message: "Sale price must be <= regular price"
            }
        },

        duration: {
            type: Number, // in minutes
            required: true,
            min: 5
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true
        },

        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            index: true
        },
        gender: {
            type: String,
            enum: ["male", "female", "unisex"],
            default: "unisex"
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);


// 🔥 TEXT SEARCH (for now instead of Elasticsearch)
serviceSchema.index({ name: "text", description: "text" });


// 🔥 BUSINESS UNIQUENESS (VERY IMPORTANT)
serviceSchema.index(
    { serviceProviderId: 1, slug: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
);


// 🔥 AUTO SLUG GENERATION
serviceSchema.pre("save", function () {
    if (this.isModified("name")) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "");
    }
});


export default mongoose.model("Service", serviceSchema);