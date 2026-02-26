import userModel from "../../models/userModel.js";

export const getAllUsers = async (req, res) => {
    try {
        const { name, email, gender, mobile, isPhoneVerified, isNewUser } = req.query;

        const query = {};

        // 🔍 Filtering
        if (name) query.name = new RegExp(name, "i");  // case-insensitive partial search
        if (email) query.email = email;
        if (gender) query.gender = gender;              // male / female / other
        if (mobile) query.mobile = mobile;

        // Boolean filters
        if (isPhoneVerified !== undefined)
            query.isPhoneVerified = isPhoneVerified === "true";

        if (isNewUser !== undefined)
            query.isNewUser = isNewUser === "true";

        // Fetch filtered users
        const users = await userModel.find(query).select("-password");

        res.status(200).json({
            success: true,
            admin: req.user,         // 🔥 admin info from JWT middleware
            results: users.length,
            users,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};