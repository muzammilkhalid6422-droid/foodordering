import express from "express";
import {
  getAllFoodItems,
  getFoodItemById,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
} from "../controllers/foodController.js";

import { uploadFoodImage } from "../middleware/uploadFoodImage.js";
import FoodItem from "../models/FoodItem.js"; // ✅ Needed for fix-rating

import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roles.js";
const router = express.Router();

/* ================= GET ALL ================= */
router.get("/", getAllFoodItems);

/* ================= FIX RATING (UTILITY ROUTE) ================= */
router.get("/fix-rating", protect, requireAdmin, async (req, res) => {
  try {
    const result = await FoodItem.updateMany(
      { rating: { $exists: false } },
      { $set: { rating: 4.2 } }
    );

    res.json({
      message: "Ratings added successfully",
      modified: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= INIT STOCK (DEFAULT 10 FOR EXISTING ITEMS) ================= */
router.get("/init-stock", protect, requireAdmin, async (req, res) => {
  try {
    const result = await FoodItem.updateMany(
      { $or: [{ stock: { $exists: false } }, { stock: null }] },
      { $set: { stock: 10 } }
    );

    res.json({
      success: true,
      message: "Default 10 stock initialized for existing food items",
      modified: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ================= GET SINGLE ================= */
router.get("/:id", getFoodItemById);

/* ================= ADD FOOD ================= */
router.post(
  "/",
  protect, requireAdmin, uploadFoodImage.single("image"), // Cloudinary upload
  addFoodItem
);

/* ================= UPDATE FOOD ================= */
router.put(
  "/:id",
  protect, requireAdmin, uploadFoodImage.single("image"), // optional new image
  updateFoodItem
);

/* ================= DELETE FOOD ================= */
router.delete("/:id", protect, requireAdmin, deleteFoodItem);

export default router;
