import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Pizza", "Burger", "Chinese", "Chicken", "Biryani"],
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    imagePublicId: String,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    stock: {
      type: Number,
      default: 10,
      min: 0,
    },
  },
  { timestamps: true },
);

const FoodItem = mongoose.model("FoodItem", foodSchema);
export default FoodItem;
