const multer = require("multer");
const sharp = require("sharp");

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        if (!allowedTypes.has(file.mimetype)) {
            return cb(new Error("Only JPEG, PNG, or WebP images are allowed."));
        }
        cb(null, true);
    }
});

async function validateImageContent(req, res, next) {
    if (!req.file) return next();

    try {
        const options = { limitInputPixels: 40_000_000 };
        const metadata = await sharp(req.file.buffer, options).metadata();
        const detectedType = {
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp"
        }[metadata.format];

        if (!detectedType || detectedType !== req.file.mimetype) {
            return res.status(400).json({
                success: false,
                message: "The uploaded file is not a valid JPEG, PNG, or WebP image."
            });
        }

        req.file.buffer = await sharp(req.file.buffer, options)
            .rotate()
            .webp({ quality: 85 })
            .toBuffer();
        req.file.mimetype = "image/webp";
        next();
    } catch {
        res.status(400).json({
            success: false,
            message: "The uploaded file is not a valid image."
        });
    }
}

module.exports = { upload, validateImageContent };