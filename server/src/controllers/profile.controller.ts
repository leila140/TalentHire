import { Request, Response, NextFunction } from "express";
import { User } from "@models/User";
import { updateProfileSchema } from "@validators/profile.validator";
import { AppError } from "@middlewares/errorHandler";
import { generateResumePdf } from "@utils/pdfExport";

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new AppError("User not found", 404);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateProfileSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.user!.id, input, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new AppError("User not found", 404);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const exportResumePdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId || req.user!.id);
    if (!user) throw new AppError("User not found", 404);

    const pdfBuffer = await generateResumePdf({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      location: user.location,
      title: user.title,
      bio: user.bio,
      skills: user.skills,
      experience: user.experience,
      education: user.education,
      languages: user.languages,
      certificates: user.certificates,
      portfolio: user.portfolio,
      github: user.github,
      linkedin: user.linkedin,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${user.fullName.replace(/\s+/g, "_")}_Resume.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
