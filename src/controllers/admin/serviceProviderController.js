import ServiceProvider from "../../models/serviceProviderModel.js";
import Address from "../../models/addressModel.js";
import Slot from "../../models/slotModel.js";

export const createServiceProvider = async (req, res) => {
    try {
        const {
            name, email, mobile, password, salonName,
            experienceYears, address, documents, slots
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

        // 🔹 Handle Address Creation if provided
        let addressId = null;
        if (address) {
            const newAddress = await Address.create({
                ...address,
                user: null // Explicitly null for service providers
            });
            addressId = newAddress._id;
        }

        // 🔹 Create Provider
        const provider = await ServiceProvider.create({
            name,
            email,
            mobile,
            password,
            salonName,
            experienceYears,
            address: addressId,
            documents
        });

        // 🔹 Create Slots if provided
        if (slots && Array.isArray(slots) && slots.length > 0) {
            const slotsToCreate = slots.map(slot => ({
                ...slot,
                serviceProvider: provider._id
            }));
            await Slot.insertMany(slotsToCreate);
        }

        // 🔹 Populate address and slots before returning
        if (addressId) await provider.populate("address");
        await provider.populate("slots");

        return res.status(201).json({
            success: true,
            message: "Service provider created successfully",
            data: provider
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
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
                .populate("address")
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
            .populate("address")
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

        // 🔹 Prevent updating sensitive unique fields via this route if needed
        // delete updates.email; 
        // delete updates.mobile;

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
