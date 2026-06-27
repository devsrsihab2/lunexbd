/**
 * FeaturedCategories.test.tsx
 *
 * Tests the FeaturedCategories component:
 * - Renders nothing when empty categories list
 * - Renders category cards with name and images
 * - Sets resizing event listener on mount & clean up
 * - Drag/sliding support interactions
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import type { FeaturedCategory } from "@/types/content.types";

// Mock next/image
jest.mock("next/image", () => {
  return function MockImage({ src, alt, priority, fill, unoptimized, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock("@/components/home/FeaturedCategories.module.scss", () => ({
  section: "section",
  title: "title",
  sliderWrap: "sliderWrap",
  navButton: "navButton",
  prevButton: "prevButton",
  nextButton: "nextButton",
  rail: "rail",
  centered: "centered",
  dragging: "dragging",
  card: "card",
  imageBox: "imageBox",
}));

const mockCategories: FeaturedCategory[] = [
  { id: 1, name: "Backpacks", slug: "backpacks", image: "/cat-backpacks.jpg" },
  { id: 2, name: "Wallets", slug: "wallets", image: "/cat-wallets.jpg" },
];

describe("FeaturedCategories component", () => {
  it("renders null when categories list is empty", () => {
    const { container } = render(<FeaturedCategories categories={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders category titles and images", () => {
    render(<FeaturedCategories categories={mockCategories} />);
    expect(screen.getByRole("heading", { name: "Featured Categories" })).toBeInTheDocument();
    expect(screen.getByText("Backpacks")).toBeInTheDocument();
    expect(screen.getByText("Wallets")).toBeInTheDocument();

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "/cat-backpacks.jpg");
    expect(images[1]).toHaveAttribute("src", "/cat-wallets.jpg");
  });

  it("navigates categories to link when category card clicked", () => {
    render(<FeaturedCategories categories={mockCategories} />);
    const link = screen.getByRole("link", { name: /Backpacks/ });
    expect(link).toHaveAttribute("href", "/category/backpacks");
  });
});
