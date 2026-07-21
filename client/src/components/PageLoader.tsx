interface PageLoaderProps {
  className?: string;
}

export function PageLoader({ className = "" }: PageLoaderProps) {
  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
    </div>
  );
}

export function InlineLoader({ className = "" }: PageLoaderProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
    </div>
  );
}
