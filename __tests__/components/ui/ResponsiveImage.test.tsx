/**
 * ResponsiveImage.test.tsx
 *
 * Tests the ResponsiveImage component:
 * - Renders blank placeholder when src is not provided
 * - Renders standard image when image src is local/external testing URL
 * - Renders Next.js Image component when standard production image URL is provided
 */
import React from "react";
import { render } from "@testing-library/react";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

jest.mock("next/image", () => {
  return function MockImage({ src, alt, fill, priority, unoptimized, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        data-fill={fill ? "true" : undefined}
        {...props}
      />
    );
  };
});

describe("ResponsiveImage component", () => {
  it("renders a blank background placeholder if src is omitted", () => {
    const { container } = render(<ResponsiveImage aspect="16 / 9" />);
    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveStyle({ aspectRatio: "16 / 9", background: "#f8f3f1" });
    expect(placeholder).toHaveAttribute("aria-hidden", "true");
  });

  it("renders standard <img> if src contains local/test domains", () => {
    const testSrc = "http://nexilup.test/uploads/image.png";
    const { container } = render(
      <ResponsiveImage src={testSrc} alt="Test Image" aspect="4 / 3" objectFit="contain" priority />
    );

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", testSrc);
    expect(img).toHaveAttribute("alt", "Test Image");
    expect(img).toHaveAttribute("loading", "eager"); // priority true
    expect(img).toHaveStyle({ width: "100%", height: "100%", objectFit: "contain" });
  });

  it("renders Next.js Image component with fill attributes for standard images", () => {
    const prodSrc = "/uploads/2026/06/bag.jpg";
    const { container } = render(
      <ResponsiveImage src={prodSrc} alt="Product Bag" sizes="100vw" />
    );

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", prodSrc);
    expect(img).toHaveAttribute("alt", "Product Bag");
    expect(img).toHaveAttribute("data-fill", "true");
    expect(img).toHaveAttribute("sizes", "100vw");
    expect(img).toHaveStyle({ objectFit: "cover" }); // default objectFit
  });
});
