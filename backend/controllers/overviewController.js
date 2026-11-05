import User from "../models/User.js";
import FoodItem from "../models/FoodItem.js";
import Order from "../models/Order.js";
import Reservation from "../models/Reservation.js";

export async function overview(req, res) {
  try {
    const [users, products, orders, reservations] = await Promise.all([
      User.find().select("name email isAdmin isSuperAdmin status createdAt lastLogin").sort({ createdAt: -1 }).lean(),
      FoodItem.find().sort({ createdAt: -1 }).lean(),
      Order.find().populate("user", "name email").sort({ createdAt: -1 }).lean(),
      Reservation.find().sort({ createdAt: -1 }).lean(),
    ]);
    res.json({ users, products, orders, reservations, revenue: orders.filter(o => o.paymentStatus === "Paid" && o.orderStatus !== "Cancelled").reduce((sum, o) => sum + o.totalAmount, 0) });
  } catch {
    res.status(500).json({ message: "Unable to load website records" });
  }
}

export async function updateOrderStatus(req, res) {
  const allowed = ["Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
  if (!allowed.includes(req.body.orderStatus)) return res.status(400).json({ message: "Invalid order status" });
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch {
    res.status(400).json({ message: "Unable to update order" });
  }
}
