/**
 * PageIntro.test.tsx
 *
 * Tests the PageIntro component:
 * - Renders heading title
 * - Renders description text when provided
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { PageIntro } from "@/components/common/PageIntro";

describe("PageIntro component", () => {
  it("renders heading and text when provided", () => {
    render(<PageIntro title="Page Title" text="Intro details text" />);

    expect(screen.getByRole("heading", { level: 1, name: "Page Title" })).toBeInTheDocument();
    expect(screen.getByText("Intro details text")).toBeInTheDocument();
  });

  it("does not render text paragraph if omitted", () => {
    const { container } = render(<PageIntro title="Page Title Only" />);
    expect(screen.getByRole("heading", { level: 1, name: "Page Title Only" })).toBeInTheDocument();
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });
});
