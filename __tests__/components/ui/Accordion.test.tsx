/**
 * Accordion.test.tsx
 *
 * Tests the Accordion component:
 * - Renders details and summary markup
 * - Displays children inside content wrapper
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Accordion } from "@/components/ui/Accordion";

describe("Accordion component", () => {
  it("renders details summary elements with title and children", () => {
    const { container } = render(
      <Accordion title="Details Title">
        <p>Details Content Info</p>
      </Accordion>
    );

    const details = container.querySelector("details");
    expect(details).toBeInTheDocument();

    const summary = container.querySelector("summary");
    expect(summary).toBeInTheDocument();
    expect(summary).toHaveTextContent("Details Title");

    expect(screen.getByText("Details Content Info")).toBeInTheDocument();
  });
});
