import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services/job.service";
import type { JobFormData } from "@/types/job";
import { useToastStore } from "@/store/toastStore";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  currency: z.string(),
  location: z.string().min(1),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  workMode: z.enum(["remote", "hybrid", "on-site"]),
  requiredSkills: z.string().min(1),
  experienceMin: z.coerce.number(),
  experienceMax: z.coerce.number(),
  deadline: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export const EditJobPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  const { data, isLoading: loadingJob } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobService.getById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (data?.data) {
      const job = data.data;
      reset({
        title: job.title,
        description: job.description,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        location: job.location,
        employmentType: job.employmentType,
        workMode: job.workMode,
        requiredSkills: job.requiredSkills.join(", "),
        experienceMin: job.experienceMin,
        experienceMax: job.experienceMax,
        deadline: job.deadline ? new Date(job.deadline).toISOString().split("T")[0] : "",
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => jobService.update(id!, formData as JobFormData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate("/recruiter/jobs");
    },
  });

  const onSubmit = async (formData: FormData) => {
    try {
      await mutation.mutateAsync(formData);
    } catch (err: any) {
      toast("error", err.response?.data?.message || "Failed to update job");
    }
  };

  if (loadingJob) return <p className="text-center text-gray-500 dark:text-gray-400">Loading job...</p>;
  if (!data?.data) return <p className="text-center text-red-500">Job not found.</p>;

  const job = data.data;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/recruiter/jobs" className="mb-4 inline-block text-sm text-primary-500 hover:underline">
        &larr; Back to my jobs
      </Link>

      <h1 className="mb-6 text-2xl font-bold">Edit Job</h1>

      {/* Company Info */}
      <div className="mb-6 rounded-lg border bg-gray-50 dark:bg-gray-900 p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Posting as
        </p>
        <div className="flex items-center gap-3">
          {job.company?.logo && (
            <img
              src={job.company.logo}
              alt={job.company.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-semibold">{job.company?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {job.company?.location}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input {...register("title")} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea {...register("description")} rows={6} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <input {...register("location")} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
            <select {...register("currency")} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="MAD">MAD</option>
              <option value="TND">TND</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Salary Min</label>
            <input {...register("salaryMin")} type="number" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Salary Max</label>
            <input {...register("salaryMax")} type="number" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Employment Type</label>
            <select {...register("employmentType")} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Work Mode</label>
            <select {...register("workMode")} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-site</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Experience Min</label>
            <input {...register("experienceMin")} type="number" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Experience Max</label>
            <input {...register("experienceMax")} type="number" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Required Skills <span className="text-gray-400 dark:text-gray-500">(comma-separated)</span>
          </label>
          <input {...register("requiredSkills")} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          {errors.requiredSkills && (
            <p className="mt-1 text-sm text-red-500">{errors.requiredSkills.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
          <input {...register("deadline")} type="date" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="w-full rounded bg-primary-500 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};
