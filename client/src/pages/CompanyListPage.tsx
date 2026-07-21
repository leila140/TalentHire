import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useCompanyList } from "@/hooks/useCompany";
import { PageLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";
import type { Company } from "@/types/company";

export const CompanyListPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useCompanyList();

  const companies = (data?.data || []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl animate-slideUp space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t("company.listTitle")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("company.listSubtitle")}</p>
      </div>

      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder={t("company.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-primary-500 dark:focus:ring-primary-800"
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <p className="text-center text-red-500 dark:text-red-400">{t("common.error")}</p>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={
            <svg className="mb-3 h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          }
          title={t("company.noCompanies")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company._id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
};

const CompanyCard = ({ company }: { company: Company }) => {
  return (
    <Link
      to={`/companies/${company._id}`}
      className="group flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 dark:hover:border-primary-800"
    >
      <div className="flex items-center gap-3">
        {company.logo ? (
          <img src={company.logo} alt={company.name} className="h-12 w-12 rounded-xl object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-lg font-bold text-white">
            {company.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-900 transition-colors group-hover:text-primary-600 dark:text-gray-100">
            {company.name}
          </h3>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{company.industry}</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {company.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {company.location}
        </span>
        <span className="flex items-center gap-1">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          {company.employees} employees
        </span>
      </div>
    </Link>
  );
};
