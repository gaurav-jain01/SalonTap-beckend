import mongoose from "mongoose";
import Category from "../../models/categoryModel.js";
import cache from "../../utils/cache.js";


export const createCategory = async (req, res) => {
    try {
        const { name, image, description, order } = req.body;

        // 🔹 Basic Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        // 🔹 Check Duplicate (case-insensitive)
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp("^" + name + "$", "i") }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }

        // 🔹 Create Category
        const category = await Category.create({
            name,
            image,
            description,
            order,
        });

        // 🔹 Clear Cache
        cache.del("homeData");

        return res.status(201).json({

            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const { id } = req.params;

        // 🔹 If ID provided → return single category
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }

            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: category
            });
        }

        // 🔹 Query Params
        const {
            page = 1,
            limit = 10,
            search = "",
            sortBy = "order",
            sortOrder = "asc"
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // 🔹 Search Filter
        const filter = {
            name: { $regex: search, $options: "i" }
        };

        // 🔹 Sorting
        const sortOptions = {
            [sortBy]: sortOrder === "asc" ? 1 : -1
        };

        // 🔹 Fetch Data
        const categories = await Category.find(filter)
            .sort(sortOptions)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Category.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            count: categories.length,
            data: categories
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { image, description, order } = req.body;

        // 🔹 Block name change
        if (req.body.name) {
            return res.status(400).json({
                success: false,
                message: "Category name cannot be changed once created"
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // 🔹 Only allowed fields update
        if (image) category.image = image;
        if (description) category.description = description;
        if (order !== undefined) category.order = order;

        await category.save();

        // 🔹 Clear Cache
        cache.del("homeData");

        return res.status(200).json({

            success: true,
            message: "Category updated successfully",
            data: category
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // 🔹 Clear Cache
        cache.del("homeData");

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// TODO: Before deactivation, check for active services and bookings
export const toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        category.isActive = !category.isActive;
        await category.save();

        // 🔹 Clear Cache
        cache.del("homeData");

        return res.status(200).json({

            success: true,
            message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
            data: category
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};