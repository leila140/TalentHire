import { User } from "@models/User";
import { Company } from "@models/Company";
import { Job } from "@models/Job";
import { Application } from "@models/Application";
import { SavedJob } from "@models/SavedJob";
import { Message } from "@models/Message";
import { Conversation } from "@models/Conversation";
import { Notification } from "@models/Notification";
import { Interview } from "@models/Interview";
import { ActivityLog } from "@models/ActivityLog";
import { ResumeAnalysis } from "@models/ResumeAnalysis";
import { Report } from "@models/Report";

export const cascadeDeleteUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) return;

  if (user.role === "recruiter") {
    const company = await Company.findOne({ createdBy: userId });
    if (company) {
      await cascadeDeleteCompany(company.id);
    }
  }

  const applications = await Application.find({ candidate: userId }).select("_id");
  const appIds = applications.map((a) => a._id);

  await Promise.all([
    Application.deleteMany({ candidate: userId }),
    SavedJob.deleteMany({ candidate: userId }),
    Notification.deleteMany({ user: userId }),
    ActivityLog.deleteMany({ user: userId }),
    ResumeAnalysis.deleteMany({ candidate: userId }),
    Report.deleteMany({ generatedBy: userId }),
    Interview.deleteMany({ candidate: userId }),
    Message.deleteMany({ sender: userId }),
  ]);

  const conversations = await Conversation.find({ participants: userId });
  for (const conv of conversations) {
    if (conv.participants.length <= 2) {
      await Message.deleteMany({ conversation: conv._id });
      await Conversation.findByIdAndDelete(conv._id);
    } else {
      await Conversation.findByIdAndUpdate(conv._id, {
        $pull: { participants: userId },
      });
    }
  }

  await User.findByIdAndDelete(userId);
};

export const cascadeDeleteCompany = async (companyId: string) => {
  const jobs = await Job.find({ company: companyId }).select("_id");
  const jobIds = jobs.map((j) => j._id);

  if (jobIds.length > 0) {
    const applications = await Application.find({ job: { $in: jobIds } }).select("_id");

    await Promise.all([
      Application.deleteMany({ job: { $in: jobIds } }),
      SavedJob.deleteMany({ job: { $in: jobIds } }),
      Interview.deleteMany({ application: { $in: applications.map((a) => a._id) } }),
    ]);
  }

  await Job.deleteMany({ company: companyId });
  await Company.findByIdAndDelete(companyId);
};

export const cascadeDeleteJob = async (jobId: string) => {
  const applications = await Application.find({ job: jobId }).select("_id");
  const appIds = applications.map((a) => a._id);

  await Promise.all([
    Application.deleteMany({ job: jobId }),
    SavedJob.deleteMany({ job: jobId }),
    Interview.deleteMany({ application: { $in: appIds } }),
  ]);

  await Job.findByIdAndDelete(jobId);
};
