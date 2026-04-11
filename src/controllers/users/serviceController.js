import mongoose from "mongoose";
import Service from "../../models/serviceModel.js";
import SubCategory from "../../models/subCategoryModel.js";

export const getServices = async (req, res) => {
    try {
        const { id } = req.params;

        // 🔹 Get single service details
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "Invalid service ID" });
            }
            const service = await Service.findOne({
                _id: id,
                isDeleted: false,
                isActive: true
            })
            .populate("category", "name")
            .populate("subCategory", "name");

            if (!service) {
                return res.status(404).json({ success: false, message: "Service not found" });
            }
            return res.status(200).json({ success: true, data: service });
        }

        // 🔹 List services with filters
        const { 
            subCategoryId, 
            categoryId, 
            search, 
            page = 1, 
            limit = 10 
        } = req.query;

        const filter = {
            isActive: true,
            isDeleted: false
        };

        if (subCategoryId) {
            if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
                return res.status(400).json({ success: false, message: "Invalid sub-category ID" });
            }
            filter.subCategory = subCategoryId;
        }

        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({ success: false, message: "Invalid category ID" });
            }
            filter.category = categoryId;
        }

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const services = await Service.find(filter)
            .populate("category", "name")
            .populate("subCategory", "name")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Service.countDocuments(filter);

        // 🔹 Suggested Services Logic
        let suggestedServices = [];
        if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
            // 1. Get current subcategory to find parent category
            const subCat = await SubCategory.findById(subCategoryId);
            
            if (subCat) {
                // 2. Find other subcategories in the same parent category
                const otherSubCats = await SubCategory.find({
                    category: subCat.category,
                    _id: { $ne: subCategoryId },
                    isActive: true
                });

                // 3. Get first service from each 'other' subcategory
                const suggestedPromises = otherSubCats.map(sc => 
                    Service.findOne({ subCategory: sc._id, isActive: true, isDeleted: false })
                    .populate("category", "name")
                    .populate("subCategory", "name")
                    .lean()
                );

                const results = await Promise.all(suggestedPromises);
                suggestedServices = results.filter(s => s !== null);
            }
        }

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            count: services.length,
            data: services,
            suggestedService: suggestedServices
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
