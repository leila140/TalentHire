import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { companyService } from "@/services/company.service";
import { useToastStore } from "@/store/toastStore";

const schema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  industry: z.string().min(1, "Industry is required"),
  employees: z.coerce.number().min(1, "At least 1 employee required"),
  location: z.string().min(1, "Location is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  benefits: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const CreateCompanyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { employees: 1 },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      companyService.create({
        ...data,
        benefits: benefitsList.length > 0 ? benefitsList : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCompany"] });
      navigate("/recruiter/jobs");
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await mutation.mutateAsync(data);
    } catch (err: any) {
      toast("error", err.response?.data?.message || "Failed to create company");
    }
  };

  const addBenefit = () => {
    const val = benefitInput.trim();
    if (val && !benefitsList.includes(val)) {
      setBenefitsList([...benefitsList, val]);
    }
    setBenefitInput("");
  };

  const removeBenefit = (b: string) => {
    setBenefitsList(benefitsList.filter((x) => x !== b));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{t("company.createTitle")}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("company.name")}</label>
          <input
            {...register("name")}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Acme Corp"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("company.description")}</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Tell candidates about your company..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("company.industry")}</label>
            <select {...register("industry")} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
              <option value="">{t("company.select")}</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Consulting">Consulting</option>
              <option value="Other">Other</option>
            </select>
            {errors.industry && <p className="mt-1 text-sm text-red-500">{errors.industry.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("company.employees")}</label>
            <input
              {...register("employees")}
              type="number"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="10"
            />
            {errors.employees && (
              <p className="mt-1 text-sm text-red-500">{errors.employees.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("company.location")}</label>
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
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("company.website")}</label>
            <input
              {...register("website")}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="https://acme.com"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-500">{errors.website.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("company.benefits")} <span className="text-gray-400 dark:text-gray-500">{t("company.benefitsOptional")}</span>
          </label>
          <div className="flex gap-2">
            <input
              value={benefitInput}
              onChange={(e) => setBenefitInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="e.g. Health Insurance"
            />
            <button
              type="button"
              onClick={addBenefit}
              className="rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {t("company.addBenefit")}
            </button>
          </div>
          {benefitsList.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {benefitsList.map((b) => (
                <span
                  key={b}
                  onClick={() => removeBenefit(b)}
                  className="flex cursor-pointer items-center gap-1 rounded bg-green-100 dark:bg-green-900/30 px-2.5 py-1 text-sm text-green-700 hover:bg-red-100 hover:text-red-700"
                >
                  {b} &times;
                </span>
              ))}
            </div>
          )}
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-500">
            {(mutation.error as any)?.response?.data?.message || "Failed to create company"}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="w-full rounded bg-primary-500 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
        >
          {mutation.isPending ? t("company.creating") : t("company.create")}
        </button>
      </form>
    </div>
  );
};
