/**
 * CmsPageView.test.tsx
 *
 * Tests the CmsPageView async component:
 * - Fetches fallback/alias pages
 * - Renders PageBanner with correct title (displays dynamic page title or static fallback)
 * - Renders ErrorState if getCmsPageWithFallbacks fails
 * - Sanitizes and renders page content successfully
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { CmsPageView } from "@/components/common/CmsPageView";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("next/server", () => ({
  connection: () => Promise.resolve(),
}));

jest.mock("@/components/ui/ErrorState", () => ({
  ErrorState: ({ message }: { message: string }) => <div data-testid="error-state">{message}</div>,
}));

jest.mock("@/components/common/PageBanner", () => ({
  PageBanner: ({ title, badge }: { title: string; badge: string }) => (
    <div data-testid="page-banner">
      <h1>{title}</h1>
      <span>{badge}</span>
    </div>
  ),
}));

jest.mock("@/services/api/content.api", () => ({
  getCmsPageWithFallbacks: jest.fn(),
}));

jest.mock("@/utils/sanitizeHtml", () => ({
  sanitizeHtml: (html: string) => html,
}));

jest.mock("@/components/common/CmsPageView.module.scss", () => ({
  cmsPage: "cmsPage",
  contentShell: "contentShell",
  content: "content",
}));

import { getCmsPageWithFallbacks } from "@/services/api/content.api";
const mockGetCmsPageWithFallbacks = getCmsPageWithFallbacks as jest.Mock;

describe("CmsPageView component", () => {
  it("renders banner and page content when API succeeds", async () => {
    mockGetCmsPageWithFallbacks.mockResolvedValueOnce({
      success: true,
      data: { title: "Dynamic Terms", content: "<p>Terms content</p>" },
    });

    const Result = await CmsPageView({ slug: "terms", title: "Fallback Terms" });
    render(Result);

    expect(screen.getByTestId("page-banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dynamic Terms" })).toBeInTheDocument();
    expect(screen.getByText("Terms content")).toBeInTheDocument();
    expect(screen.getByText("Official page")).toBeInTheDocument();
  });

  it("renders ErrorState when API fails", async () => {
    mockGetCmsPageWithFallbacks.mockResolvedValueOnce({
      success: false,
      message: "Page not found",
    });

    const Result = await CmsPageView({ slug: "privacy", title: "Privacy Policy" });
    render(Result);

    expect(screen.getByTestId("error-state")).toBeInTheDocument();
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.getByText("Needs attention")).toBeInTheDocument();
  });
});
