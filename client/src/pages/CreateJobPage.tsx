import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services/job.service";
import { companyService } from "@/services/company.service";
import { useToastStore } from "@/store/toastStore";
import type { JobFormData } from "@/types/job";
import { SKILL_SUGGESTIONS, EMPLOYMENT_TYPES, WORK_MODES, CURRENCIES } from "@/utils/constants";

const schema = z.object({
  title: z.string().min(3, "Title is too short"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  currency: z.string().default("USD"),
  location: z.string().min(1, "Location is required"),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  workMode: z.enum(["remote", "hybrid", "on-site"]),
  requiredSkills: z.string().min(1, "At least one skill required"),
  experienceMin: z.coerce.number().default(0),
  experienceMax: z.coerce.number().default(10),
  deadline: z.string().min(1, "Deadline is required"),
});

type FormData = z.infer<typeof schema>;

export const CreateJobPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const { data: companyData, isLoading: loadingCompany } = useQuery({
    queryKey: ["myCompany"],
    queryFn: () => companyService.getMyCompany(),
    retry: false,
  });

  const company = companyData?.data;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "USD",
      employmentType: "full-time",
      workMode: "remote",
      experienceMin: 0,
      experienceMax: 10,
    },
  });

  const formValues = watch();

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      jobService.create({
        ...data,
        requiredSkills: data.requiredSkills || selectedSkills.join(", "),
      } as JobFormData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate("/recruiter/jobs");
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const skills = selectedSkills.length > 0 ? selectedSkills.join(", ") : data.requiredSkills;
      await mutation.mutateAsync({ ...data, requiredSkills: skills });
    } catch (err: any) {
      toast("error", err.response?.data?.message || "Failed to create job");
    }
  };

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      const updated = [...selectedSkills, skill];
      setSelectedSkills(updated);
      setValue("requiredSkills", updated.join(", "));
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    const updated = selectedSkills.filter((s) => s !== skill);
    setSelectedSkills(updated);
    setValue("requiredSkills", updated.join(", "));
  };

  const filteredSkillSuggestions = SKILL_SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !selectedSkills.includes(s)
  );

  if (loadingCompany) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Loading company info...</p>;
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold">Post a Job</h1>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          You need to create a company before posting a job.
        </p>
        <Link
          to="/company/create"
          className="inline-block rounded bg-primary-500 px-6 py-2 text-white hover:bg-primary-600"
        >
          Create Company
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Post a Job</h1>

      {/* Company Info */}
      <div className="mb-6 rounded-lg border bg-gray-50 dark:bg-gray-900 p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Posting as
        </p>
        <div className="flex items-center gap-3">
          {company.logo && (
            <img
              src={company.logo}
              alt={company.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-semibold">{company.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {company.industry} &middot; {company.location}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input
            {...register("title")}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Senior Frontend Developer"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            {...register("description")}
            rows={6}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Describe the role, responsibilities, and requirements..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <input
              {...register("location")}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="New York, NY"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
            <select {...register("currency")} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Salary Min</label>
            <input
              {...register("salaryMin")}
              type="number"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Salary Max</label>
            <input
              {...register("salaryMax")}
              type="number"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="120000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Employment Type</label>
            <select {...register("employmentType")} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
              {EMPLOYMENT_TYPES.map((et) => (
                <option key={et.value} value={et.value}>{et.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Work Mode</label>
            <select {...register("workMode")} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
              {WORK_MODES.map((wm) => (
                <option key={wm.value} value={wm.value}>{wm.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Experience Min (years)</label>
            <input
              {...register("experienceMin")}
              type="number"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Experience Max (years)</label>
            <input
              {...register("experienceMax")}
              type="number"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        {/* Skills Autocomplete */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Required Skills</label>
          <div className="relative">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="Type to search skills..."
            />
            {skillInput && filteredSkillSuggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded border bg-white dark:bg-gray-900 shadow-lg">
                {filteredSkillSuggestions.map((skill) => (
                  <li
                    key={skill}
                    onClick={() => addSkill(skill)}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-gray-300"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedSkills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedSkills.map((skill) => (
                <span
                  key={skill}
                  onClick={() => removeSkill(skill)}
                  className="flex cursor-pointer items-center gap-1 rounded bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 text-sm text-blue-700 hover:bg-red-100 hover:text-red-700"
                >
                  {skill} &times;
                </span>
              ))}
            </div>
          )}
          <input type="hidden" {...register("requiredSkills")} />
          {errors.requiredSkills && (
            <p className="mt-1 text-sm text-red-500">{errors.requiredSkills.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Application Deadline</label>
          <input
            {...register("deadline")}
            type="date"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
          {errors.deadline && (
            <p className="mt-1 text-sm text-red-500">{errors.deadline.message}</p>
          )}
        </div>

        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-primary-500 hover:underline"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>

        {showPreview && (
          <div className="rounded-lg border bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 className="text-xl font-bold">{formValues.title || "Job Title"}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{company?.name}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Location: {formValues.location || "—"}</span>
              <span>Work mode: {formValues.workMode}</span>
              <span>
                Salary: {formValues.salaryMin ? `${formValues.currency} ${formValues.salaryMin}${formValues.salaryMax ? ` - ${formValues.salaryMax}` : "+"}` : "Not specified"}
              </span>
              <span>Experience: {formValues.experienceMin}-{formValues.experienceMax} years</span>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Required Skills</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {selectedSkills.length > 0
                  ? selectedSkills.map((s) => (
                      <span key={s} className="rounded bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-sm text-gray-700 dark:text-gray-300">
                        {s}
                      </span>
                    ))
                  : <span className="text-sm text-gray-400 dark:text-gray-500">—</span>}
              </div>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {formValues.description || "No description written yet."}
              </p>
            </div>
          </div>
        )}

        {mutation.isError && (
          <p className="text-sm text-red-500">
            {(mutation.error as any)?.response?.data?.message || "Failed to create job"}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="w-full rounded bg-primary-500 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
        >
          {mutation.isPending ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
};
