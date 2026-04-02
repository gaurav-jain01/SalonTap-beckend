import SubCategory from "../../models/subCategoryModel.js";
import Category from "../../models/categoryModel.js";
import mongoose from "mongoose";

export const createSubCategory = async (req, res) => {
    try {
        const { name, image, description, categoryId } = req.body;

        // 🔹 Basic Validation
        if (!name || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "Sub-category name and category ID are required"
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

        // 🔹 Check Duplicate Sub-Category (within same category, case-insensitive)
        const existingSubCategory = await SubCategory.findOne({
            name: { $regex: new RegExp("^" + name + "$", "i") },
            category: categoryId
        });

        if (existingSubCategory) {
            return res.status(400).json({
                success: false,
                message: "Sub-category already exists in this category"
            });
        }

        // 🔹 Create Sub-Category
        const newSubCategory = await SubCategory.create({
            name,
            image,
            description,
            category: categoryId
        });

        return res.status(201).json({
            success: true,
            message: "Sub-category created successfully",
            data: newSubCategory
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getSubCategories = async (req, res) => {
    try {
        const { id } = req.params;

        // 🔹 If ID provided → return single sub-category
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid sub-category ID"
                });
            }

            const subCategory = await SubCategory.findById(id).populate("category", "name");

            if (!subCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Sub-category not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: subCategory
            });
        }

        // 🔹 Query Params
        const {
            page = 1,
            limit = 10,
            search = "",
            categoryId
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

        // 🔹 Fetch Data
        const subCategories = await SubCategory.find(filter)
            .populate("category", "name")
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await SubCategory.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            count: subCategories.length,
            data: subCategories
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { image, description, categoryId } = req.body;

        // 🔹 Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sub-category ID"
            });
        }

        const subCategory = await SubCategory.findById(id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub-category not found"
            });
        }

        // 🔹 Block name change
        if (req.body.name) {
            return res.status(400).json({
                success: false,
                message: "Sub-category name cannot be changed once created"
            });
        }

        // 🔹 Validate Category ID if provided
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

            // 🔹 Check duplicate in new category
            const existingSubCategory = await SubCategory.findOne({
                name: subCategory.name,
                category: categoryId,
                _id: { $ne: id }
            });

            if (existingSubCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Sub-category already exists in this category"
                });
            }

            subCategory.category = categoryId;
        }

        // 🔹 Update allowed fields
        if (image) subCategory.image = image;
        if (description) subCategory.description = description;

        await subCategory.save();

        // 🔹 Populate before returning
        await subCategory.populate("category", "name");

        return res.status(200).json({
            success: true,
            message: "Sub-category updated successfully",
            data: subCategory
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// TODO: Before deactivation, check for active services and bookings
export const toggleSubCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sub-category ID"
            });
        }

        const subCategory = await SubCategory.findById(id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub-category not found"
            });
        }

        subCategory.isActive = !subCategory.isActive;
        await subCategory.save();

        return res.status(200).json({
            success: true,
            message: `Sub-category ${subCategory.isActive ? "activated" : "deactivated"} successfully`,
            data: subCategory
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sub-category ID"
            });
        }

        const subCategory = await SubCategory.findById(id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub-category not found"
            });
        }

        await SubCategory.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Sub-category deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
