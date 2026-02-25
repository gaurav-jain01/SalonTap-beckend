import User from "../models/userModel.js"
import generateToken from "../utils/generateToken.js";

// Sample controller
export const sendOtp = async (req, res) => {
  const { mobile } = req.body;

  const otp = "123456";
  const otpExpiry = Date.now() + 2 * 60 * 1000;

  let user = await User.findOne({ mobile });

  if (!user) {
    // New user: create entry
    user = await User.create({
      mobile,
      otp,
      otpExpiry,
      isPhoneVerified: false,
      isNewUser: true,
    });
  } else {
    // Existing user: update OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.isNewUser = false;
    await user.save();
  }

  // send sms here
  // sendSMS(mobile, `Your OTP code is ${otp}`);

  res.json({ success: true, message: "OTP sent" });
};

export const verifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;

  const user = await User.findOne({ mobile });

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  if (user.otp != otp) {
    return res.status(400).json({ success: false, error: "Invalid OTP" });
  }

  if (user.otpExpiry < Date.now()) {
    return res.status(400).json({ success: false, error: "OTP expired" });
  }

  // OTP verified → login or registration is complete
  user.isPhoneVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  const token = generateToken(res, user._id);

  res.json({
    success: true,
    message: "Login Successful",
    user,
    token,
    isNewUser: !user.name, // optional detection
  });
};

export const profile = async (req, res) => {
  const { name, email, gender } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  user.name = name;
  user.email = email;
  user.gender = gender;
  await user.save();

  res.json({ success: true,
    user: {
        _id: user._id,
        mobile: user.mobile,
        name: user.name || "",
        email: user.email || "",
        gender: user.gender || "",
        isPhoneVerified: user.isPhoneVerified,
        isNewUser: user.isNewUser
      }, 
    message: "Profile updated" });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email mobile gender isPhoneVerified isNewUser"
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        mobile: user.mobile,
        name: user.name || "",
        email: user.email || "",
        gender: user.gender || "",
        isPhoneVerified: user.isPhoneVerified,
        isNewUser: user.isNewUser
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};