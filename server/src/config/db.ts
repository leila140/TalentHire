import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("⚠️  MONGODB_URI not defined — skipping database connection");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.warn("⚠️  Server will continue without database. Fix MONGODB_URI in .env");
  }
};
