import bannerModel from "../../models/bannerModel.js";
import categoryModel from "../../models/categoryModel.js";
import serviceModel from "../../models/serviceModel.js";
import subCategoryModel from "../../models/subCategoryModel.js";
import mongoose from "mongoose";
import cache from "../../utils/cache.js";


export const getHomeData = async (req, res) => {
    try {
        const cachedData = cache.get("homeData");
        if (cachedData) {
            return res.status(200).json({
                success: true,
                data: cachedData
            });
        }

        const [banners, services, categories] = await Promise.all([
            bannerModel.find({ isActive: true }).sort({ order: 1 }).lean(),
            serviceModel.find({ isActive: true, isDeleted: false }).sort({ order: 1 }).limit(4).lean(),
            categoryModel.find({ isActive: true }).sort({ order: 1 }).lean()
        ]);
        
        const homeData = {
            banners,
            categories,
            services
        };

        cache.set("homeData", homeData, 600); // 10 minutes cache

        return res.status(200).json({
            success: true,
            data: homeData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



export const getSubCategoriesByCategoryId = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const subCategories = await subCategoryModel.find({ category: categoryId, isActive: true }).sort({ order: 1 });

        return res.status(200).json({
            success: true,
            data: subCategories
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getServicesBySubCategoryId = async (req, res) => {
    try {
        const { subCategoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sub-category ID"
            });
        }

        const services = await serviceModel.find({ subCategory: subCategoryId, isActive: true, isDeleted: false }).sort({ order: 1 });

        return res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

