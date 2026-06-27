/**
 * Loader.test.tsx
 *
 * Tests the Loader component:
 * - Renders with status role and Loading aria label
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Loader } from "@/components/ui/Loader";

jest.mock("@/components/ui/Feedback.module.scss", () => ({
  loader: "loader-class",
}));

describe("Loader component", () => {
  it("renders loader span with correct aria-label and role", () => {
    render(<Loader />);
    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute("aria-label", "Loading");
    expect(loader).toHaveClass("loader-class");
  });
});
