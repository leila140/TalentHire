import { Component, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">Something went wrong</h2>
            <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              An unexpected error occurred. Please try again or return to the home page.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Try Again
              </button>
              <Link
                to="/"
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                Go Home
              </Link>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  Error details
                </summary>
                <pre className="mt-2 max-w-md overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {this.state.error.message}
                  {"\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
