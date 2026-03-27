import mongoose from "mongoose";
import ServiceProvider from "../../models/serviceProviderModel.js";
import Address from "../../models/addressModel.js";
import Slot from "../../models/slotModel.js";

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
        const { serviceProviderId, addressId, slotsData, startDate, days = 7 } = req.body;

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

        const start = startDate ? new Date(startDate) : new Date();
        const slotsToCreate = [];

        // 🔹 Generate slots from the dayOfWeek schedule
        for (let i = 0; i < parseInt(days); i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            
            // JS getDay(): 0 (Sun) to 6 (Sat)
            const dayNum = currentDate.getDay(); 

            // Find matching day in slotsData
            const dayConfig = slotsData.find(d => Number(d.dayOfWeek) === dayNum);
            
            if (dayConfig && Array.isArray(dayConfig.slots)) {
                // ISO string '2026-03-27'
                const dateStr = currentDate.toISOString().split('T')[0];
                
                dayConfig.slots.forEach(s => {
                    slotsToCreate.push({
                        serviceProviderId,
                        addressId,
                        date: dateStr,
                        startTime: s.startTime,
                        endTime: s.endTime
                    });
                });
            }
        }

        if (slotsToCreate.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No slots generated. Please check your dayOfWeek mapping and days range."
            });
        }

        // 🔹 Bulk insert (ordered: false ignores duplicates)
        try {
            const result = await Slot.insertMany(slotsToCreate, { ordered: false });
            // 🔹 Update Provider Flag
            await ServiceProvider.findByIdAndUpdate(serviceProviderId, { isSlotsFilled: true });

            return res.status(201).json({
                success: true,
                message: "Slots added successfully",
                count: result.length
            });
        } catch (bulkError) {
            // Handled duplicated index error
            return res.status(207).json({
                success: true,
                message: "Slots processed (existing ones skipped)",
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
