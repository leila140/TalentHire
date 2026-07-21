import { Request, Response, NextFunction } from "express";
import { User } from "@models/User";
import { escapeRegex, parsePagination } from "@utils/helpers";

export const searchCandidates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, skills, location } = req.query;
    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });

    const filter: Record<string, unknown> = { role: "candidate" };

    if (search) {
      const searchRegex = new RegExp(escapeRegex(String(search)), "i");
      filter.$or = [
        { fullName: searchRegex },
        { title: searchRegex },
        { bio: searchRegex },
        { skills: searchRegex },
      ];
    }

    if (skills) {
      const skillList = String(skills).split(",").map((s) => s.trim());
      filter.skills = { $in: skillList };
    }

    if (location) {
      filter.location = new RegExp(escapeRegex(String(location)), "i");
    }

    const [candidates, total] = await Promise.all([
      User.find(filter)
        .select("fullName email avatarUrl title skills location experience education bio")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: candidates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
