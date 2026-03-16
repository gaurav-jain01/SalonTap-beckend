import bannerModel from "../../models/bannerModel.js";
import categoryModel from "../../models/categoryModel.js";
import serviceModel from "../../models/serviceModel.js";

export const getHomeData = async (req, res) => {
    try {
        const banners = await bannerModel.find({ isActive: true }).sort({ order: 1 });
        const services = await serviceModel.find({ isActive: true }).sort({ order: 1 });
        const categories = await categoryModel.find({ isActive: true }).sort({ order: 1 });
        return res.status(200).json({
            success: true,
            data: {
                banners,
                categories,
                services
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};