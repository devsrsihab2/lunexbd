/**
 * Skeleton.test.tsx
 *
 * Tests the Skeleton component:
 * - Renders page layout skeleton when variant="page"
 * - Renders simple stack of line skeletons with different widths when variant="default"
 */
import React from "react";
import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/Skeleton";

jest.mock("@/components/ui/Feedback.module.scss", () => ({
  skeleton: "skeleton-line",
  pageSkeleton: "page-skeleton",
  skeletonTopbar: "skeleton-topbar",
  skeletonLogo: "skeleton-logo",
  skeletonNav: "skeleton-nav",
  skeletonContainer: "skeleton-container",
  skeletonHero: "skeleton-hero",
  skeletonHeroText: "skeleton-hero-text",
  skeletonHeroImage: "skeleton-hero-image",
  skeletonContent: "skeleton-content",
  skeletonSidebar: "skeleton-sidebar",
  skeletonGrid: "skeleton-grid",
  skeletonCard: "skeleton-card",
}));

describe("Skeleton component", () => {
  it("renders simple stack of line skeletons by default", () => {
    const { container } = render(<Skeleton lines={4} />);
    const stack = container.querySelector(".stack");
    expect(stack).toBeInTheDocument();
    expect(stack).toHaveAttribute("aria-hidden", "true");

    const lines = stack?.querySelectorAll(".skeleton-line");
    expect(lines).toHaveLength(4);
    
    // First line should be taller
    expect(lines?.[0]).toHaveStyle({ height: "1.75rem", width: "100%" });
    expect(lines?.[1]).toHaveStyle({ height: "1rem", width: "88%" });
  });

  it("renders page layout skeleton when variant is page", () => {
    const { container } = render(<Skeleton variant="page" />);
    const pageSec = container.querySelector(".page-skeleton");
    expect(pageSec).toBeInTheDocument();
    expect(pageSec).toHaveAttribute("aria-hidden", "true");

    expect(container.querySelector(".skeleton-logo")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-sidebar")).toBeInTheDocument();
    
    const cards = container.querySelectorAll(".skeleton-card");
    expect(cards).toHaveLength(8);
  });
});
