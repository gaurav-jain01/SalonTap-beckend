import mongoose from "mongoose";
import Service from "../../models/serviceModel.js";
import Category from "../../models/categoryModel.js";
import SubCategory from "../../models/subCategoryModel.js";

export const createService = async (req, res) => {
    try {
        const { name, image, description, regularPrice, salePrice, duration, categoryId, subCategoryId, order } = req.body;

        // 🔹 Basic Validation
        if (!name || regularPrice === undefined || salePrice === undefined || !duration || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "Name, regularPrice, salePrice, duration, and category ID are required"
            });
        }

        // 🔹 Validate Category ID
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        // 🔹 Check if Category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // 🔹 Validate Sub-Category ID if provided
        if (subCategoryId) {
            if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid sub-category ID"
                });
            }

            const subCategory = await SubCategory.findById(subCategoryId);
            if (!subCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Sub-category not found"
                });
            }

            // 🔹 Ensure Sub-Category belongs to the selected Category
            if (subCategory.category.toString() !== categoryId) {
                return res.status(400).json({
                    success: false,
                    message: "Sub-category does not belong to the selected category"
                });
            }
        }

        // 🔹 Check Duplicate Service (within same category & sub-category, case-insensitive)
        const checkFilter = {
            name: { $regex: new RegExp("^" + name + "$", "i") },
            category: categoryId
        };
        if (subCategoryId) checkFilter.subCategory = subCategoryId;

        const existingService = await Service.findOne(checkFilter);

        if (existingService) {
            return res.status(400).json({
                success: false,
                message: "Service already exists in this category/sub-category"
            });
        }

        // 🔹 Create Service
        const service = await Service.create({
            name,
            image,
            description,
            regularPrice,
            salePrice,
            duration,
            category: categoryId,
            subCategory: subCategoryId || null,
            order
        });

        return res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: service
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getServices = async (req, res) => {
    try {
        const { id } = req.params;

        // 🔹 If ID provided → return single service
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid service ID"
                });
            }

            const service = await Service.findById(id)
                .populate("category", "name")
                .populate("subCategory", "name");

            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: "Service not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: service
            });
        }

        // 🔹 Query Params
        const {
            page = 1,
            limit = 10,
            search = "",
            sortBy = "order",
            sortOrder = "asc",
            categoryId,
            subCategoryId
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // 🔹 Build Filter
        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }
            filter.category = categoryId;
        }

        if (subCategoryId) {
            if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid sub-category ID"
                });
            }
            filter.subCategory = subCategoryId;
        }

        // 🔹 Sorting
        const sortOptions = {
            [sortBy]: sortOrder === "asc" ? 1 : -1
        };

        // 🔹 Fetch Data
        const services = await Service.find(filter)
            .populate("category", "name")
            .populate("subCategory", "name")
            .sort(sortOptions)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Service.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            count: services.length,
            data: services
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, description, regularPrice, salePrice, duration, categoryId, subCategoryId, order } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID"
            });
        }

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // 🔹 If Category or Subcategory update is requested, validate them
        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }
            const category = await Category.findById(categoryId);
            if (!category) return res.status(404).json({ success: false, message: "Category not found" });
            service.category = categoryId;
        }

        if (subCategoryId) {
            if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid sub-category ID"
                });
            }
            const subCategory = await SubCategory.findById(subCategoryId);
            if (!subCategory) return res.status(404).json({ success: false, message: "Sub-category not found" });

            // Validate sub-category belongs to category
            const targetCategoryId = categoryId || service.category.toString();
            if (subCategory.category.toString() !== targetCategoryId) {
                return res.status(400).json({
                    success: false,
                    message: "Sub-category does not belong to the selected category"
                });
            }
            service.subCategory = subCategoryId;
        } else if (req.body.hasOwnProperty('subCategoryId') && !subCategoryId) {
            // Explicitly setting subCategory to null
            service.subCategory = null;
        }

        // 🔹 Update other fields
        if (name) service.name = name;
        if (image) service.image = image;
        if (description) service.description = description;
        if (regularPrice !== undefined) service.regularPrice = regularPrice;
        if (salePrice !== undefined) service.salePrice = salePrice;
        if (duration !== undefined) service.duration = duration;
        if (order !== undefined) service.order = order;

        await service.save();

        await service.populate("category", "name");
        await service.populate("subCategory", "name");

        return res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: service
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const toggleServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID"
            });
        }

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        service.isActive = !service.isActive;
        await service.save();

        return res.status(200).json({
            success: true,
            message: `Service ${service.isActive ? "activated" : "deactivated"} successfully`,
            data: service
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID"
            });
        }

        const service = await Service.findByIdAndDelete(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
