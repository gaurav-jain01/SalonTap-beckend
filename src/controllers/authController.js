import User from "../models/userModel.js"
import generateToken from "../utils/generateToken.js";

// Sample controller
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        // check if user already exist
        const query = [];
        if (email) query.push({ email });
        if (mobile) query.push({ mobile });

        if (query.length > 0) {
            const userExists = await User.findOne({ $or: query });
            if (userExists) {
                return res.status(400).json({ success: false, error: "User already exists" });
            }
        }
        const user = await User.create({ name, email, password, mobile });


        const token = generateToken(res, user._id);

        res.status(201).json({ success: true, data: user, token });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        if (password != user.password) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const token = generateToken(res, user._id);

        res.status(200).json({ success: true, data: user, token });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

