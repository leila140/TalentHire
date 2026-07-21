import { Request, Response, NextFunction } from "express";
import { User } from "@models/User";
import { Job } from "@models/Job";
import { Application } from "@models/Application";
import { Company } from "@models/Company";
import { AppError } from "@middlewares/errorHandler";
import { logActivity } from "./activity.controller";
import { escapeRegex, parsePagination } from "@utils/helpers";
import { cascadeDeleteUser, cascadeDeleteCompany, cascadeDeleteJob } from "@utils/cascade";
import { ActivityLog } from "@models/ActivityLog";

// --- Jobs management (admin) ---

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, isActive, employmentType, workMode } = req.query;
    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });

    const filter: Record<string, unknown> = {};
    if (search) {
      const searchRegex = new RegExp(escapeRegex(String(search)), "i");
      filter.$or = [{ title: searchRegex }, { location: searchRegex }];
    }
    if (isActive === "true") filter.isActive = true;
    else if (isActive === "false") filter.isActive = false;
    if (employmentType) filter.employmentType = employmentType;
    if (workMode) filter.workMode = workMode;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("company", "name logo location")
        .populate("createdBy", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError("Job not found", 404);
    logActivity(req.user!.id, "job_delete", "job", String(req.params.id), { title: job.title }, req.ip);
    await cascadeDeleteJob(String(req.params.id));
    res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// --- Applications management (admin) ---

export const getApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate("candidate", "fullName email avatarUrl")
        .populate({ path: "job", populate: { path: "company", select: "name" } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalJobs, totalApplications, totalCompanies, usersByRole] =
      await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
        Application.countDocuments(),
        Company.countDocuments(),
        User.aggregate([
          { $group: { _id: "$role", count: { $sum: 1 } } },
        ]),
      ]);

    const recentUsers = await User.find()
      .select("fullName email role createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        usersByRole: usersByRole.reduce(
          (acc: Record<string, number>, r: { _id: string; count: number }) => {
            acc[r._id] = r.count;
            return acc;
          },
          {} as Record<string, number>
        ),
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, search } = req.query;
    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });

    const filter: Record<string, unknown> = {};
    if (role && role !== "all") filter.role = role;
    if (search) {
      const searchRegex = new RegExp(escapeRegex(String(search)), "i");
      filter.$or = [{ fullName: searchRegex }, { email: searchRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("fullName email role isEmailVerified createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(id, { role }, { new: true })
      .select("fullName email role isEmailVerified");

    if (!user) throw new AppError("User not found", 404);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) throw new AppError("User not found", 404);
    logActivity(req.user!.id, "user_delete", "user", String(id), { name: user.fullName, email: user.email }, req.ip);
    await cascadeDeleteUser(String(id));
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isApproved } = req.query;
    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });

    const filter: Record<string, unknown> = {};
    if (isApproved === "true") filter.isApproved = true;
    else if (isApproved === "false") filter.isApproved = false;

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .populate("createdBy", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Company.countDocuments(filter),
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

export const approveCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) throw new AppError("Company not found", 404);

    company.isApproved = true;
    await company.save();
    logActivity(req.user!.id, "company_approve", "company", String(id), { name: company.name }, req.ip);

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) throw new AppError("Company not found", 404);
    logActivity(req.user!.id, "company_delete", "company", String(req.params.id), { name: company.name }, req.ip);
    await cascadeDeleteCompany(String(req.params.id));
    res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) throw new AppError("Application not found", 404);
    logActivity(req.user!.id, "application_delete", "application", String(req.params.id), {}, req.ip);
    res.status(200).json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      userSignups,
      applicationsByStatus,
      jobsByType,
      jobsByWorkMode,
      companyApproval,
      recentActivity,
    ] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Application.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Job.aggregate([
        { $group: { _id: "$employmentType", count: { $sum: 1 } } },
      ]),
      Job.aggregate([
        { $group: { _id: "$workMode", count: { $sum: 1 } } },
      ]),
      Company.aggregate([
        { $group: { _id: "$isApproved", count: { $sum: 1 } } },
      ]),
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              action: "$action",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
        { $limit: 100 },
      ]),
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const userGrowth = userSignups.map((item: any) => ({
      name: monthNames[item._id.month - 1] + " " + item._id.year,
      users: item.count,
    }));

    const applicationBreakdown = applicationsByStatus.map((item: any) => ({
      name: item._id.replace("-", " "),
      value: item.count,
    }));

    const jobTypeBreakdown = jobsByType.map((item: any) => ({
      name: item._id,
      value: item.count,
    }));

    const workModeBreakdown = jobsByWorkMode.map((item: any) => ({
      name: item._id,
      value: item.count,
    }));

    const companyApprovalData = companyApproval.map((item: any) => ({
      name: item._id ? "Approved" : "Pending",
      value: item.count,
    }));

    const activityByDate: Record<string, number> = {};
    recentActivity.forEach((item: any) => {
      activityByDate[item._id.date] = (activityByDate[item._id.date] || 0) + item.count;
    });
    const activityTimeline = Object.entries(activityByDate)
      .map(([date, count]) => ({ date, actions: count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      data: {
        userGrowth,
        applicationBreakdown,
        jobTypeBreakdown,
        workModeBreakdown,
        companyApprovalData,
        activityTimeline,
      },
    });
  } catch (error) {
    next(error);
  }
};
