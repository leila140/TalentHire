import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI || "",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
    accessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
};
