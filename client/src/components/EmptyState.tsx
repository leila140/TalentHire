import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center rounded-2xl border border-violet-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900 py-16 text-slate-400 dark:text-gray-500 shadow-md shadow-violet-500/5 ${className}`}>
      {icon || (
        <svg className="mb-3 h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
      <p className="text-lg font-medium text-slate-600 dark:text-gray-300">{title}</p>
      {description && <p className="mt-1 text-sm">{description}</p>}
      {action && action.to && (
        <Link to={action.to} className="mt-3 text-sm font-medium text-violet-600 transition-colors hover:text-violet-700">
          {action.label}
        </Link>
      )}
      {action && action.onClick && !action.to && (
        <button onClick={action.onClick} className="mt-3 text-sm font-medium text-violet-600 transition-colors hover:text-violet-700">
          {action.label}
        </button>
      )}
    </div>
  );
}
