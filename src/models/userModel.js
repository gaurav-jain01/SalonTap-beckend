import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    password: String,
    otp: String,
    otpExpiry: Date,
});

const User = mongoose.model("User", userSchema);

export default User;