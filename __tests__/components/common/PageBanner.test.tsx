/**
 * PageBanner.test.tsx
 *
 * Tests the PageBanner component:
 * - Renders title and description (text) correctly
 * - Displays eyebrow prefix (defaults to Lunexbd)
 * - Renders badge conditionally
 * - Renders side image conditionally
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { PageBanner } from "@/components/common/PageBanner";

jest.mock("next/image", () => {
  return function MockImage({ src, alt, priority, fill, unoptimized, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock("@/components/common/PageBanner.module.scss", () => ({
  banner: "banner",
  pattern: "pattern",
  inner: "inner",
  content: "content",
  contentBox: "contentBox",
  eyebrowRow: "eyebrowRow",
  eyebrowDot: "eyebrowDot",
  eyebrow: "eyebrow",
  title: "title",
  text: "text",
  badge: "badge",
  media: "media",
  imageShape: "imageShape",
  glassCircleOne: "glassCircleOne",
  glassCircleTwo: "glassCircleTwo",
}));

describe("PageBanner component", () => {
  it("renders basic title and default eyebrow", () => {
    render(<PageBanner title="About Us" />);
    expect(screen.getByRole("heading", { name: "About Us" })).toBeInTheDocument();
    expect(screen.getByText("Lunexbd")).toBeInTheDocument();
  });

  it("renders custom eyebrow and text details", () => {
    render(<PageBanner title="Welcome" eyebrow="Hello Custom" text="Intro text" />);
    expect(screen.getByText("Hello Custom")).toBeInTheDocument();
    expect(screen.getByText("Intro text")).toBeInTheDocument();
  });

  it("renders conditional badge and image", () => {
    const { container } = render(<PageBanner title="Welcome" badge="Exclusive" image="/sample.jpg" />);
    expect(screen.getByText("Exclusive")).toBeInTheDocument();
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/sample.jpg");
  });
});
