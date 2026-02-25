import Address from "../models/addressModel.js";

export const addAddress = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        console.log("Adding address - req.body:", req.body);

        const {
            description,
            main_text,
            secondary_text,
            place_id,
            latitude,
            longitude,
            houseNumber,
            label,
            isLocationsFilled
        } = req.body || {};

        const address = await Address.create({
            user: user._id,   // ✅ Only store ObjectId
            description,
            main_text,
            secondary_text,
            place_id,
            latitude,
            longitude,
            houseNumber,
            label,
            isLocationsFilled
        });

        return res.status(201).json({
            success: true,
            message: "Address added successfully",
            data: address
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error adding address",
            error: error.message
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

        const address = await Address.findByIdAndUpdate(id, {
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