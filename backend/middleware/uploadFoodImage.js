// middleware/uploadFoodImage.js

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

import path from "node:path";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
const uploadDir = fileURLToPath(new URL("../uploads/food/", import.meta.url));
mkdirSync(uploadDir, { recursive: true });
const cloudEnabled = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
const storage = cloudEnabled ? new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "yumigo-food",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
}) : multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) =>
    cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});

export const uploadFoodImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] };
    const valid = allowed[file.mimetype]?.includes(path.extname(file.originalname).toLowerCase());
    cb(valid ? null : new Error("Upload a JPG, PNG or WebP image"), Boolean(valid));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});
