import mongoose from "mongoose";
import Banner from "../../models/bannerModel.js";
import Service from "../../models/serviceModel.js";
import cache from "../../utils/cache.js";


export const createBanner = async (req, res) => {
    try {
        const { title, image, description, linkType, serviceId, externalLink, order } = req.body;

        // 🔹 Basic Validation
        if (!title || !image) {
            return res.status(400).json({
                success: false,
                message: "Title and image are required"
            });
        }

        // 🔹 Validate Service ID if linkType is 'service'
        if (linkType === "service" && serviceId) {
            if (!mongoose.Types.ObjectId.isValid(serviceId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid service ID"
                });
            }

            const service = await Service.findById(serviceId);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: "Service not found"
                });
            }
        }

        // 🔹 Create Banner
        const banner = await Banner.create({
            title,
            image,
            description,
            linkType: linkType || "none",
            service: serviceId || null,
            externalLink: externalLink || null,
            order: order || 0
        });

        // 🔹 Clear Cache
        cache.del("homeData");

        return res.status(201).json({

            success: true,
            message: "Banner created successfully",
            data: banner
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getBanners = async (req, res) => {
    try {
        const { id } = req.params;

        // 🔹 If ID provided → return single banner
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid banner ID"
                });
            }

            const banner = await Banner.findById(id).populate("service", "name regularPrice salePrice");

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    message: "Banner not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: banner
            });
        }

        // 🔹 Query Params
        const {
            page = 1,
            limit = 10,
            sortBy = "order",
            sortOrder = "asc",
            status // active, inactive
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // 🔹 Build Filter
        const filter = {};
        if (status === "active") filter.isActive = true;
        if (status === "inactive") filter.isActive = false;

        // 🔹 Sorting
        const sortOptions = {
            [sortBy]: sortOrder === "asc" ? 1 : -1
        };

        // 🔹 Fetch Data
        const banners = await Banner.find(filter)
            .populate("service", "name regularPrice salePrice")
            .sort(sortOptions)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Banner.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: banners
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, image, description, linkType, serviceId, externalLink, order, isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID"
            });
        }

        const banner = await Banner.findById(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        // 🔹 Update fields
        if (title) banner.title = title;
        if (image) banner.image = image;
        if (description !== undefined) banner.description = description;
        if (order !== undefined) banner.order = order;
        if (isActive !== undefined) banner.isActive = isActive;

        // 🔹 Handle linking
        if (linkType) {
            banner.linkType = linkType;
            if (linkType === "service" && serviceId) {
                if (!mongoose.Types.ObjectId.isValid(serviceId)) {
                    return res.status(400).json({ success: false, message: "Invalid service ID" });
                }
                const serviceExists = await Service.exists({ _id: serviceId });
                if (!serviceExists) return res.status(404).json({ success: false, message: "Service not found" });
                banner.service = serviceId;
                banner.externalLink = null;
            } else if (linkType === "external" && externalLink) {
                banner.externalLink = externalLink;
                banner.service = null;
            } else if (linkType === "none") {
                banner.service = null;
                banner.externalLink = null;
            }
        }

        await banner.save();
        await banner.populate("service", "name");

        // 🔹 Clear Cache
        cache.del("homeData");

        return res.status(200).json({

            success: true,
            message: "Banner updated successfully",
            data: banner
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID"
            });
        }

        const banner = await Banner.findByIdAndDelete(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        // 🔹 Clear Cache
        cache.del("homeData");

        return res.status(200).json({

            success: true,
            message: "Banner deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const toggleBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID"
            });
        }

        const banner = await Banner.findById(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        return res.status(200).json({

            success: true,
            message: "Banner status toggled successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}