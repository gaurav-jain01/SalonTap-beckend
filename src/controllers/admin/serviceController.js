import mongoose from "mongoose";
import Service from "../../models/serviceModel.js";
import Category from "../../models/categoryModel.js";
import SubCategory from "../../models/subCategoryModel.js";

export const createService = async (req, res) => {
    try {
        const {
            name,
            image,
            description,
            regularPrice,
            salePrice,
            duration,
            categoryId,
            subCategoryId
        } = req.body;

        // 🔹 Basic Validation
        if (!name || regularPrice === undefined || salePrice === undefined || !duration || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "Name, regularPrice, salePrice, duration, and category ID are required"
            });
        }

        // 🔹 Price Validation
        if (salePrice > regularPrice) {
            return res.status(400).json({
                success: false,
                message: "Sale price cannot be greater than regular price"
            });
        }

        // 🔹 Validate Category
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // 🔹 Validate SubCategory
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

            if (subCategory.category.toString() !== categoryId) {
                return res.status(400).json({
                    success: false,
                    message: "Sub-category does not belong to the selected category"
                });
            }
        }

        // 🔥 Generate slug (IMPORTANT)
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "");

        // 🔥 Duplicate check (GLOBAL)
        const existingService = await Service.findOne({
            slug,
            isDeleted: false
        });

        if (existingService) {
            return res.status(400).json({
                success: false,
                message: "Service already exists"
            });
        }

        // 🔹 Create Service
        const service = await Service.create({
            name,
            slug,
            images: image ? [image] : [],
            description,
            regularPrice,
            salePrice,
            duration,
            category: categoryId,
            subCategory: subCategoryId || null
        });

        return res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: {
                id: service._id,
                name: service.name,
                slug: service.slug
            }
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

        // 🔹 Get single service
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid service ID"
                });
            }

            const service = await Service.findOne({
                _id: id,
                isDeleted: false,
                isActive: true
            })
                .populate("category", "name")
                .populate("subCategory", "name")
                .lean();

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
            categoryId,
            subCategoryId,
            sortBy = "createdAt", // NEW
            order = "desc"        // NEW
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // 🔹 Base Filter (IMPORTANT)
        const filter = {
            isDeleted: false,
            isActive: true
        };

        // 🔹 Search (basic for now)
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { slug: { $regex: search, $options: "i" } }
            ];
        }

        // 🔹 Category Filter
        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }
            filter.category = categoryId;
        }

        // 🔹 SubCategory Filter
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
            [sortBy]: order === "asc" ? 1 : -1
        };

        // 🔹 Fetch Data
        const services = await Service.find(filter)
            .populate("category", "name")
            .populate("subCategory", "name")
            .sort(sortOptions)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .lean();

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
        const {
            name,
            image,
            description,
            regularPrice,
            salePrice,
            duration,
            categoryId,
            subCategoryId
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID"
            });
        }

        const service = await Service.findOne({
            _id: id,
            isDeleted: false
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // 🔹 Price validation
        const finalRegularPrice = regularPrice ?? service.regularPrice;
        const finalSalePrice = salePrice ?? service.salePrice;

        if (finalSalePrice > finalRegularPrice) {
            return res.status(400).json({
                success: false,
                message: "Sale price cannot be greater than regular price"
            });
        }

        // 🔹 Category validation
        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }

            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }

            service.category = categoryId;
        }

        // 🔹 SubCategory validation
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

            const targetCategoryId = categoryId || service.category.toString();

            if (subCategory.category.toString() !== targetCategoryId) {
                return res.status(400).json({
                    success: false,
                    message: "Sub-category does not belong to the selected category"
                });
            }

            service.subCategory = subCategoryId;
        }
        else if (req.body.hasOwnProperty("subCategoryId") && !subCategoryId) {
            service.subCategory = null;
        }

        // 🔥 Handle name + slug
        if (name) {
            const slug = name
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^\w\-]+/g, "");

            // 🔥 Duplicate check
            const existing = await Service.findOne({
                slug,
                _id: { $ne: id },
                isDeleted: false
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Service with this name already exists"
                });
            }

            service.name = name;
            service.slug = slug;
        }

        // 🔹 Other fields
        if (image) service.images = [image]; // or push if needed
        if (description !== undefined) service.description = description;
        if (regularPrice !== undefined) service.regularPrice = regularPrice;
        if (salePrice !== undefined) service.salePrice = salePrice;
        if (duration !== undefined) service.duration = duration;

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

        const service = await Service.findOne({
            _id: id,
            isDeleted: false
        });

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
            data: {
                id: service._id,
                isActive: service.isActive
            }
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

        const service = await Service.findOne({
            _id: id,
            isDeleted: false
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // 🔥 Soft delete
        service.isDeleted = true;
        service.isActive = false;

        await service.save();

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
