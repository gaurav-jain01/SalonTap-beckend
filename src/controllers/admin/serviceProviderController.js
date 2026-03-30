import mongoose from "mongoose";
import ServiceProvider from "../../models/serviceProviderModel.js";
import Address from "../../models/addressModel.js";
import Slot from "../../models/slotModel.js";
import Document from "../../models/documentModel.js";

export const createServiceProvider = async (req, res) => {
    try {
        const {
            name, email, mobile, password, salonName,
            experienceYears, profileImage
        } = req.body;

        // 🔹 Basic Validation
        if (!name || !email || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, mobile, and password are required"
            });
        }

        // 🔹 Check for duplicates
        const existingProvider = await ServiceProvider.findOne({
            $or: [{ email: email.toLowerCase() }, { mobile }]
        });

        if (existingProvider) {
            return res.status(400).json({
                success: false,
                message: "Service provider with this email or mobile already exists"
            });
        }

        // 🔹 Create Provider
        const provider = await ServiceProvider.create({
            name,
            email,
            mobile,
            password,
            salonName,
            experienceYears,
            profileImage,
            isBasicInfoFilled: true
        });

        return res.status(201).json({
            success: true,
            message: "Service provider created successfully. Next: add address(es) and slots.",
            data: provider
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const addServiceProviderAddress = async (req, res) => {
    try {
        const {
            serviceProviderId,
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

        // 🔹 Basic Validation
        if (!serviceProviderId) {
            return res.status(400).json({
                success: false,
                message: "Service provider ID is required"
            });
        }

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

        // 🔹 Check provider exists
        const provider = await ServiceProvider.findById(serviceProviderId);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Service provider not found"
            });
        }

        // 🔹 Handle default address (only one allowed)
        if (isDefault) {
            await Address.updateMany(
                { serviceProvider: serviceProviderId },
                { $set: { isDefault: false } }
            );
        }

        // 🔥 Create address
        const address = await Address.create({
            serviceProvider: serviceProviderId,
            user: null,

            main_text,
            secondary_text,
            place_id,
            description,

            location: {
                type: "Point",
                coordinates: [longitude, latitude] // IMPORTANT
            },

            houseNumber,
            landmark,
            label,
            isDefault: isDefault || false,
            isLocationsFilled: true
        });

        // 🔹 Update Provider Flag
        await ServiceProvider.findByIdAndUpdate(serviceProviderId, { isAddressFilled: true });

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

export const addServiceProviderSlots = async (req, res) => {
    try {
        const { serviceProviderId, addressId, slotsData } = req.body;

        if (!serviceProviderId || !addressId || !slotsData || !Array.isArray(slotsData)) {
            return res.status(400).json({
                success: false,
                message: "serviceProviderId, addressId, and slotsData (array) are required"
            });
        }

        // 🔹 Basic check for provider and address
        const provider = await ServiceProvider.findById(serviceProviderId);
        if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });

        const address = await Address.findById(addressId);
        if (!address || address.serviceProvider?.toString() !== serviceProviderId) {
            return res.status(404).json({ success: false, message: "Address not found or does not belong to this provider" });
        }

        const slotsToCreate = [];

        // 🔹 Extract repeating slots from input (slots is now an array of strings)
        slotsData.forEach(dayConfig => {
            const dayNum = Number(dayConfig.dayOfWeek);
            if (Array.isArray(dayConfig.slots)) {
                dayConfig.slots.forEach(timeString => {
                    slotsToCreate.push({
                        serviceProviderId,
                        addressId,
                        dayOfWeek: dayNum,
                        time: timeString
                    });
                });
            }
        });

        if (slotsToCreate.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No slots found in the request."
            });
        }

        // 🔹 Bulk insert
        try {
            const result = await Slot.insertMany(slotsToCreate, { ordered: false });
            await ServiceProvider.findByIdAndUpdate(serviceProviderId, { isSlotsFilled: true });

            return res.status(201).json({
                success: true,
                message: "Weekly schedule saved successfully",
                count: result.length
            });
        } catch (bulkError) {
            return res.status(207).json({
                success: true,
                message: "Schedule updated (existing slots skipped)",
                count: bulkError.insertedDocs?.length || 0
            });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getServiceProviders = async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "Invalid provider ID" });
            }
            const provider = await ServiceProvider.findById(id)
                .populate("addresses")
                .populate("slots");

            if (!provider) {
                return res.status(404).json({ success: false, message: "Provider not found" });
            }
            return res.status(200).json({ success: true, data: provider });
        }

        const {
            page = 1,
            limit = 10,
            search = "",
            status,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { salonName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }
        if (status) filter.status = status;

        const providers = await ServiceProvider.find(filter)
            .populate("addresses")
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await ServiceProvider.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: providers
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateServiceProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid provider ID" });
        }

        const provider = await ServiceProvider.findByIdAndUpdate(id, updates, { new: true });

        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Provider updated successfully",
            data: provider
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteServiceProvider = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid provider ID" });
        }

        const provider = await ServiceProvider.findByIdAndDelete(id);

        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Provider deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleServiceProviderStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid provider ID" });
        }

        const provider = await ServiceProvider.findById(id);
        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        // Toggle status between 'active' and 'inactive'
        provider.status = provider.status === "active" ? "inactive" : "active";
        await provider.save();

        return res.status(200).json({
            success: true,
            message: `Provider status updated to ${provider.status}`,
            data: provider
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🔹 Address Controllers
export const getServiceProviderAddress = async (req, res) => {
    try {
        const { id } = req.params; // Provider ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid provider ID" });
        }
        const addresses = await Address.find({ serviceProvider: id });
        return res.status(200).json({ success: true, data: addresses });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateServiceProviderAddress = async (req, res) => {
    try {
        const { id } = req.params; // Address ID
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid address ID" });
        }

        // Handle location update if lat/lng are provided
        if (updates.latitude !== undefined && updates.longitude !== undefined) {
            updates.location = {
                type: "Point",
                coordinates: [updates.longitude, updates.latitude]
            };
        }

        // Handle default switch
        if (updates.isDefault) {
            const address = await Address.findById(id);
            if (address && address.serviceProvider) {
                await Address.updateMany(
                    { serviceProvider: address.serviceProvider },
                    { $set: { isDefault: false } }
                );
            }
        }

        const address = await Address.findByIdAndUpdate(id, updates, { new: true });
        if (!address) return res.status(404).json({ success: false, message: "Address not found" });

        return res.status(200).json({ success: true, message: "Address updated successfully", data: address });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteServiceProviderAddress = async (req, res) => {
    try {
        const { id } = req.params; // Address ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid address ID" });
        }
        const address = await Address.findByIdAndDelete(id);
        if (!address) return res.status(404).json({ success: false, message: "Address not found" });

        return res.status(200).json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🔹 Slots Controllers
export const getServiceProviderSlots = async (req, res) => {
    try {
        const { id } = req.params; // Provider ID
        const { dayOfWeek, addressId } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid provider ID" });
        }

        const filter = { serviceProviderId: id };

        // 🔹 Filter by Address if provided
        if (addressId) {
            if (!mongoose.Types.ObjectId.isValid(addressId)) {
                return res.status(400).json({ success: false, message: "Invalid address ID" });
            }
            filter.addressId = addressId;
        }

        // 🔹 Filter by Day (direct 0-6)
        if (dayOfWeek !== undefined) {
            const dayNum = Number(dayOfWeek);
            if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
                return res.status(400).json({ success: false, message: "dayOfWeek must be a number between 0 and 6" });
            }
            filter.dayOfWeek = dayNum;
        }

        const slots = await Slot.find(filter).sort({ time: 1 });

        return res.status(200).json({ 
            success: true, 
            count: slots.length,
            requestedDay: dayOfWeek !== undefined ? dayOfWeek : "Any",
            data: slots 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateServiceProviderSlots = async (req, res) => {
    try {
        const { id } = req.params; // Slot ID
        const updates = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid slot ID" });
        }
        const slot = await Slot.findByIdAndUpdate(id, updates, { new: true });
        if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });
        return res.status(200).json({ success: true, message: "Slot updated successfully", data: slot });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteServiceProviderSlots = async (req, res) => {
    try {
        const { id } = req.params; // Slot ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid slot ID" });
        }
        const slot = await Slot.findByIdAndDelete(id);
        if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });
        return res.status(200).json({ success: true, message: "Slot deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🔹 Document Controllers
export const addServiceProviderDocument = async (req, res) => {
    try {
        const { serviceProviderId, type, fileUrl } = req.body;

        if (!serviceProviderId || !type || !fileUrl) {
            return res.status(400).json({
                success: false,
                message: "serviceProviderId, type (name), and fileUrl (image url) are required"
            });
        }

        const document = await Document.create({
            serviceProviderId,
            type, // This is the 'name' of the document (e.g. "aadhaar")
            fileUrl
        });

        // 🔹 Update Provider Flag
        await ServiceProvider.findByIdAndUpdate(serviceProviderId, { isKYCSubmitted: true });

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            data: document
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getServiceProviderDocuments = async (req, res) => {
    try {
        const { id } = req.params; // Provider ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid provider ID" });
        }
        const documents = await Document.find({ serviceProviderId: id });
        return res.status(200).json({ success: true, data: documents });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
