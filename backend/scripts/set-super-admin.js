import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run superadmin -- registered-email@example.com");
  process.exit(1);
}
try {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email });
  if (!user) throw new Error("Account not found. Sign up first.");
  user.isSuperAdmin = true;
  user.isAdmin = true;
  await user.save();
  console.log(`Super Admin enabled for ${user.email}. Log in again.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
