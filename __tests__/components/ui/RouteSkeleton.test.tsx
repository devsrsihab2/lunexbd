/**
 * RouteSkeleton.test.tsx
 *
 * Tests the RouteSkeleton component:
 * - Renders panel and line shells
 */
import React from "react";
import { render } from "@testing-library/react";
import { RouteSkeleton } from "@/components/ui/RouteSkeleton";

jest.mock("@/components/ui/RouteSkeleton.module.scss", () => ({
  shell: "skeleton-shell",
  panel: "skeleton-panel",
  line: "skeleton-line",
  block: "skeleton-block",
}));

describe("RouteSkeleton component", () => {
  it("renders shell layout with lines and block placeholders", () => {
    const { container } = render(<RouteSkeleton />);
    const shell = container.querySelector(".skeleton-shell");
    expect(shell).toBeInTheDocument();
    expect(shell).toHaveAttribute("aria-hidden", "true");

    expect(shell?.querySelector(".skeleton-panel")).toBeInTheDocument();
    expect(shell?.querySelectorAll(".skeleton-line")).toHaveLength(3);
    expect(shell?.querySelector(".skeleton-block")).toBeInTheDocument();
  });
});
