import userModel from "../../models/userModel.js";
import addressModel from "../../models/addressModel.js";

export const getAllUser = async (req, res) => {
    try {
        const { name, email, gender, mobile, isPhoneVerified, isNewUser, search, isActive } = req.query;

        const query = {};

        // 🔎 SEARCH (partial match)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } },
                { status: { $regex: search, $options: "i" } }
            ];
        }

        // 🎯 FILTERS
        if (name) query.name = new RegExp(name, "i");
        if (email) query.email = email;
        if (gender) query.gender = gender;
        if (mobile) query.mobile = mobile;

        if (isPhoneVerified !== undefined)
            query.isPhoneVerified = isPhoneVerified === "true";

        if (isNewUser !== undefined)
            query.isNewUser = isNewUser === "true";

        if (isActive !== undefined)
            query.isActive = isActive === "true";

        // Fetch users
        const users = await userModel.find(query).select("name email mobile gender profileImage createdAt isActive");

        res.status(200).json({
            success: true,
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

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id).select("name email mobile gender profileImage createdAt isActive");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const address = await addressModel.find({ user: id });
        res.status(200).json({
            success: true,
            user,
            address,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, gender, profileImage, profileImagePublicId, isActive } = req.body;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (name) user.name = name;
        if (email) user.email = email;
        if (gender) user.gender = gender;
        if (profileImage) user.profileImage = profileImage;
        if (profileImagePublicId) user.profileImagePublicId = profileImagePublicId;
        if (isActive !== undefined) user.isActive = isActive;
        await user.save();
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

