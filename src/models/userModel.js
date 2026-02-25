import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    mobile: { type: String, unique: true, sparse: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    isPhoneVerified: { type: Boolean, default: false },
    isNewUser: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;