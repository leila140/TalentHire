import { Request, Response, NextFunction } from "express";
import { Skill } from "@models/Skill";
import { escapeRegex, parsePagination } from "@utils/helpers";

export const searchSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, category } = req.query;
    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });
    const filter: Record<string, unknown> = {};

    if (q) filter.name = { $regex: escapeRegex(String(q)), $options: "i" };
    if (category) filter.category = String(category);

    const [skills, total] = await Promise.all([
      Skill.find(filter).sort({ popularity: -1 }).skip(skip).limit(limit),
      Skill.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: skills,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getPopularSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
    const skills = await Skill.find().sort({ popularity: -1 }).limit(limit);
    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
};

export const seedSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ success: false, message: "skills array is required" });
    }

    const results = await Promise.allSettled(
      skills.map(async (s: { name: string; category: string }) => {
        return Skill.findOneAndUpdate(
          { name: s.name.toLowerCase().trim() },
          { $setOnInsert: { name: s.name.toLowerCase().trim(), category: s.category }, $inc: { popularity: 1 } },
          { upsert: true, new: true }
        );
      })
    );

    const seeded = results.filter((r) => r.status === "fulfilled").map((r: any) => r.value);
    res.status(201).json({ success: true, data: seeded });
  } catch (error) {
    next(error);
  }
};
