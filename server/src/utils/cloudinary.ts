import { v2 as cloudinary } from "cloudinary";
import { env } from "@config/env";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export const uploadToCloudinary = async (
  filePath: string,
  folder: string,
  resourceType: "image" | "raw" | "auto" = "auto"
): Promise<{ url: string; publicId: string }> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
  });
  return { url: result.secure_url, publicId: result.public_id };
};

export const deleteFromCloudinary = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};
