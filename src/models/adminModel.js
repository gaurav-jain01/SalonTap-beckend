import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "super_admin"],
        default: "admin"
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

const adminModel = mongoose.model("admin", adminSchema);

export default adminModel;