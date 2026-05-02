import userModel from "../../models/userModel.js";
import addressModel from "../../models/addressModel.js";
import walletModel from "../../models/walletModel.js";

export const createUser = async (req, res) => {
    try {
        const { name, email, gender, mobile, profileImage, profileImagePublicId } = req.body;
        const user = await userModel.create({ name, email, gender, mobile, profileImage, profileImagePublicId });
        const wallet = await walletModel.create({ userId: user._id, balance: { available: 0, hold: 0 } });

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
}

export const getAllUser = async (req, res) => {
    try {
        const {
            name, email, gender, mobile,
            isPhoneVerified, isNewUser, search, isActive,
            page = 1, limit = 10
        } = req.query;

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

        // Pagination
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch total document count for meta data
        const totalUsers = await userModel.countDocuments(query);

        // Fetch users with pagination
        const users = await userModel.find(query)
            .select("name email mobile gender profileImage createdAt isActive")
            .skip(skip)
            .limit(limitNumber);

        // Fetch wallets for these users
        const wallets = await walletModel.find({ userId: { $in: users.map(u => u._id) } }).select("userId balance.available");
        const walletMap = wallets.reduce((acc, wallet) => {
            acc[wallet.userId.toString()] = wallet.balance.available;
            return acc;
        }, {});

        // Attach wallet balance to each user
        const usersWithWallet = users.map(user => ({
            ...user.toObject(),
            walletBalance: walletMap[user._id.toString()] || 0
        }));

        res.status(200).json({
            success: true,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limitNumber),
            currentPage: pageNumber,
            results: usersWithWallet.length,
            users: usersWithWallet,
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
        const address = await addressModel.find({ user: id }).select("-user -serviceProvider -__v -updatedAt");
        const wallet = await walletModel.findOne({ userId: id }).select("balance currency status -_id");

        res.status(200).json({
            success: true,
            user,
            address,
            wallet: wallet || null,
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