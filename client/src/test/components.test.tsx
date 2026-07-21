import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Pagination, SimplePagination } from "@/components/Pagination";
import { PageLoader, InlineLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      const map: Record<string, string> = {
        "common.previous": "Previous",
        "common.next": "Next",
        "common.pageOf": `Page ${opts?.page} of ${opts?.pages}`,
      };
      return map[key] || key;
    },
  }),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe("Pagination", () => {
  it("renders nothing when pages <= 1", () => {
    const { container } = render(<Pagination page={1} pages={1} onPageChange={() => {}} />, { wrapper });
    expect(container.innerHTML).toBe("");
  });

  it("renders page buttons", () => {
    render(<Pagination page={1} pages={3} onPageChange={() => {}} />, { wrapper });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("disables previous on first page", () => {
    render(<Pagination page={1} pages={3} onPageChange={() => {}} />, { wrapper });
    expect(screen.getByText("Previous")).toBeDisabled();
  });

  it("disables next on last page", () => {
    render(<Pagination page={3} pages={3} onPageChange={() => {}} />, { wrapper });
    expect(screen.getByText("Next")).toBeDisabled();
  });
});

describe("SimplePagination", () => {
  it("renders nothing when pages <= 1", () => {
    const { container } = render(<SimplePagination page={1} pages={1} onPageChange={() => {}} />, { wrapper });
    expect(container.innerHTML).toBe("");
  });

  it("renders page info", () => {
    render(<SimplePagination page={2} pages={5} onPageChange={() => {}} />, { wrapper });
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });
});

describe("PageLoader", () => {
  it("renders a spinner", () => {
    const { container } = render(<PageLoader />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});

describe("InlineLoader", () => {
  it("renders a spinner", () => {
    const { container } = render(<InlineLoader />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No items found" description="Try adjusting your filters" />, { wrapper });
    expect(screen.getByText("No items found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
  });

  it("renders action link when provided", () => {
    render(<EmptyState title="Empty" action={{ label: "Go somewhere", to: "/somewhere" }} />, { wrapper });
    expect(screen.getByText("Go somewhere")).toBeInTheDocument();
  });
});
