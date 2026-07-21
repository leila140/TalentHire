import { Request, Response, NextFunction } from "express";
import { User } from "@models/User";
import { AppError } from "@middlewares/errorHandler";
import { uploadToCloudinary, deleteFromCloudinary } from "@utils/cloudinary";
import fs from "fs";

const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
};

export const uploadAvatarHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError("No file uploaded", 400);

    const user = await User.findById(req.user!.id).select("avatarUrl");
    if (user?.avatarUrl) {
      const publicId = extractPublicId(user.avatarUrl);
      if (publicId) {
        try { await deleteFromCloudinary(publicId); } catch (err) { console.error("Failed to delete old avatar from Cloudinary:", err); }
      }
    }

    const result = await uploadToCloudinary(req.file.path, "talenthire/avatars", "image");
    fs.unlinkSync(req.file.path);

    const updated = await User.findByIdAndUpdate(
      req.user!.id,
      { avatarUrl: result.url },
      { new: true }
    );

    res.status(200).json({ success: true, data: { avatarUrl: result.url } });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const uploadResumeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError("No file uploaded", 400);

    const user = await User.findById(req.user!.id).select("resumeUrl");
    if (user?.resumeUrl) {
      const publicId = extractPublicId(user.resumeUrl);
      if (publicId) {
        try { await deleteFromCloudinary(publicId); } catch (err) { console.error("Failed to delete old resume from Cloudinary:", err); }
      }
    }

    const resourceType = req.file.mimetype.startsWith("image/") ? "image" : "raw";
    const result = await uploadToCloudinary(req.file.path, "talenthire/resumes", resourceType);
    fs.unlinkSync(req.file.path);

    await User.findByIdAndUpdate(
      req.user!.id,
      { resumeUrl: result.url },
      { new: true }
    );

    res.status(200).json({ success: true, data: { resumeUrl: result.url } });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const deleteAvatarHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.id).select("avatarUrl");
    if (!user?.avatarUrl) throw new AppError("No avatar to delete", 404);

    const publicId = extractPublicId(user.avatarUrl);
    if (publicId) {
      try { await deleteFromCloudinary(publicId); } catch (err) { console.error("Failed to delete avatar from Cloudinary:", err); }
    }

    await User.findByIdAndUpdate(req.user!.id, { $unset: { avatarUrl: "" } });
    res.status(200).json({ success: true, message: "Avatar deleted" });
  } catch (error) {
    next(error);
  }
};

export const deleteResumeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.id).select("resumeUrl");
    if (!user?.resumeUrl) throw new AppError("No resume to delete", 404);

    const publicId = extractPublicId(user.resumeUrl);
    if (publicId) {
      try { await deleteFromCloudinary(publicId); } catch (err) { console.error("Failed to delete resume from Cloudinary:", err); }
    }

    await User.findByIdAndUpdate(req.user!.id, { $unset: { resumeUrl: "" } });
    res.status(200).json({ success: true, message: "Resume deleted" });
  } catch (error) {
    next(error);
  }
};
