/**
 * Toast.test.tsx
 *
 * Tests the ToastContainer component:
 * - Renders a polite live region for toast messages
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { ToastContainer } from "@/components/ui/Toast";

describe("ToastContainer component", () => {
  it("renders live region wrapper with polite and atomic attributes", () => {
    const { container } = render(<ToastContainer />);
    const region = container.firstChild as HTMLElement;
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
  });
});
