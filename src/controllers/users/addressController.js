import Address from "../../models/addressModel.js";

export const addAddress = async (req, res) => {
    try {
        const user = req.user;

        // 🔹 Ensure logged-in user
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const userId = user._id;

        const {
            description,
            main_text,
            secondary_text,
            place_id,
            latitude,
            longitude,
            houseNumber,
            landmark,
            label,
            isDefault
        } = req.body;

        // 🔹 Validation
        if (!main_text || !secondary_text) {
            return res.status(400).json({
                success: false,
                message: "Main and secondary address text are required"
            });
        }

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Latitude and Longitude are required"
            });
        }

        // 🔹 Handle default logic (only one default per user)
        if (isDefault) {
            await Address.updateMany(
                { user: userId },
                { $set: { isDefault: false } }
            );
        }

        // 🔥 Create address
        const address = await Address.create({
            user: userId,
            serviceProvider: null, // ✅ important

            main_text,
            secondary_text,
            place_id,
            description,

            location: {
                type: "Point",
                coordinates: [longitude, latitude] // ✅ IMPORTANT ORDER
            },

            houseNumber,
            landmark,
            label,
            isDefault: isDefault || false,
            isLocationsFilled: true
        });

        return res.status(201).json({
            success: true,
            message: "Address added successfully",
            data: address
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllAddress = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const addresses = await Address.find({ user: user._id });

        return res.status(200).json({
            success: true,
            message: "Addresses fetched successfully",
            data: addresses
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching addresses",
            error: error.message
        });
    }
};

export const getSingleAddress = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const { id } = req.params;

        const address = await Address.findById(id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Address fetched successfully",
            data: address
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching address",
            error: error.message
        });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const { id } = req.params;
        const { description, main_text, secondary_text, place_id, latitude, longitude, houseNumber, label, isLocationsFilled } = req.body || {};

        const address = await Address.findByIdAndUpdate(
            { _id: id, user: user._id },
            {
                description,
                main_text,
                secondary_text,
                place_id,
                latitude,
                longitude,
                houseNumber,
                label,
                isLocationsFilled
            }, { new: true });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: address
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating address",
            error: error.message
        });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const { id } = req.params;

        const address = await Address.findByIdAndDelete(id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully",
            data: address
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting address",
            error: error.message
        });
    }
};