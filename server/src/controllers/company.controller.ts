import { Request, Response, NextFunction } from "express";
import { Company } from "@models/Company";
import { Job } from "@models/Job";
import { User } from "@models/User";
import { createCompanySchema, updateCompanySchema } from "@validators/company.validator";
import { AppError } from "@middlewares/errorHandler";
import { uploadToCloudinary, deleteFromCloudinary } from "@utils/cloudinary";
import fs from "fs";
import { logActivity } from "./activity.controller";
import { parsePagination } from "@utils/helpers";

export const createCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createCompanySchema.parse(req.body);
    const company = await Company.create({ ...input, createdBy: req.user!.id });
    await User.findByIdAndUpdate(req.user!.id, { company: company.id });
    logActivity(req.user!.id, "company_create", "company", company.id, { name: company.name }, req.ip as string);
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

export const getMyCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findOne({ createdBy: req.user!.id });
    if (!company) throw new AppError("Company not found", 404);
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

export const getCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findById(req.params.id).populate("createdBy", "fullName avatarUrl");
    if (!company) throw new AppError("Company not found", 404);

    const jobCount = await Job.countDocuments({ company: company.id, isActive: true });

    res.status(200).json({ success: true, data: { ...company.toObject(), activeJobCount: jobCount } });
  } catch (error) {
    next(error);
  }
};

export const getCompanyJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = { company: req.params.id, isActive: true, deadline: { $gte: new Date() } };

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateCompanySchema.parse(req.body);
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user!.id },
      input,
      { new: true, runValidators: true }
    );
    if (!company) throw new AppError("Company not found", 404);
    logActivity(req.user!.id, "company_update", "company", req.params.id as string, { name: company.name }, req.ip);
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

export const listCompanies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });

    const [companies, total] = await Promise.all([
      Company.find({ isApproved: true }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Company.countDocuments({ isApproved: true }),
    ]);

    res.status(200).json({
      success: true,
      data: companies,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const addGalleryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError("No file uploaded", 400);

    const company = await Company.findOne({ createdBy: req.user!.id });
    if (!company) throw new AppError("Company not found", 404);

    const result = await uploadToCloudinary(req.file.path, "talenthire/company-gallery", "image");
    fs.unlinkSync(req.file.path);

    company.gallery.push({
      url: result.url,
      caption: req.body.caption || "",
      publicId: result.publicId,
    });
    await company.save();

    res.status(200).json({ success: true, data: company.gallery });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const removeGalleryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageId } = req.params;
    const company = await Company.findOne({ createdBy: req.user!.id });
    if (!company) throw new AppError("Company not found", 404);

    const galleryArray = company.gallery as any;
    const image = galleryArray.id(imageId);
    if (!image) throw new AppError("Image not found", 404);

    if (image.publicId) {
      try { await deleteFromCloudinary(image.publicId); } catch (err) { console.error("Failed to delete gallery image from Cloudinary:", err); }
    }

    galleryArray.pull(imageId);
    await company.save();

    res.status(200).json({ success: true, data: company.gallery });
  } catch (error) {
    next(error);
  }
};
