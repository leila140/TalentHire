import { Skeleton } from "@/components/ui/skeleton";

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-3/4" />
      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
      <div className="mt-4 flex gap-3 border-t border-gray-50 dark:border-gray-800 pt-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-5 py-3">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {Array.from({ length: rows }).map((_, row) => (
              <tr key={row}>
                {Array.from({ length: cols }).map((_, col) => (
                  <td key={col} className="px-5 py-4">
                    <Skeleton className="h-3 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-8 w-12" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-slideUp">
      <Skeleton className="h-32 w-full rounded-3xl" />
      <StatsSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 space-y-2">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}
