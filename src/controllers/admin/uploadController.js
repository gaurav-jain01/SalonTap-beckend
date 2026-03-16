import cloudinary from "../config/cloudinary.js";

export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No image provided" });

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "salontap/profile",
        transformation: [
          { width: 600, height: 600, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error)
          return res.status(500).json({ success: false, error: error.message });

        res.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    stream.end(req.file.buffer);

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: "No files uploaded" });

    const folder = req.body.folder || "salontap/products";
    const uploaded = [];

    let pending = req.files.length;

    req.files.forEach((file) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { width: 600, height: 600, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) console.log(error);

          uploaded.push({
            url: result.secure_url,
            public_id: result.public_id
          });

          pending--;
          if (pending === 0) {
            return res.json({ success: true, images: uploaded });
          }
        }
      );

      stream.end(file.buffer);
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id)
      return res.status(400).json({ success: false, message: "public_id required" });

    await cloudinary.uploader.destroy(public_id);

    res.json({ success: true, message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};