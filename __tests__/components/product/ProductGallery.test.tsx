/**
 * ProductGallery.test.tsx
 *
 * Tests the ProductGallery component:
 * - Renders main image and thumbnails
 * - Renders fallback "No image" UI when image list is empty or invalid
 * - Updates active image when thumbnail button is clicked
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductGallery } from "@/components/product/ProductGallery";
import type { ProductImage } from "@/types/product.types";

// ── Mocks ──────────────────────────────────────────────────────────────────
// Mock next/image to render a normal img without warnings
jest.mock("next/image", () => {
  return function MockImage({ src, alt, priority, fill, unoptimized, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock("@/components/product/ProductGallery.module.scss", () => ({
  gallery: "gallery",
  thumbnails: "thumbnails",
  thumbnail: "thumbnail",
  activeThumbnail: "activeThumbnail",
  emptyThumb: "emptyThumb",
  emptyImage: "emptyImage",
  mainImage: "mainImage",
  check: "check",
}));

const mockImages: ProductImage[] = [
  { src: "https://images.unsplash.com/photo-1", alt: "First Image", thumbnail: "https://images.unsplash.com/photo-1-thumb" },
  { src: "https://images.unsplash.com/photo-2", alt: "Second Image" },
];

describe("ProductGallery component", () => {
  it("renders empty state when no images are provided", () => {
    render(<ProductGallery images={[]} productName="Sample Product" />);
    expect(screen.getByText("No image")).toBeInTheDocument();
  });

  it("renders main image and thumbnails when images are provided", () => {
    const { container } = render(<ProductGallery images={mockImages} productName="Sample Product" />);
    // Main image (by default the first index) scoped inside mainImage container
    const mainImg = container.querySelector(".mainImage img");
    expect(mainImg).toBeInTheDocument();
    expect(mainImg).toHaveAttribute("src", "https://images.unsplash.com/photo-1");

    // Thumbnails
    const thumbnails = screen.getAllByRole("button");
    expect(thumbnails).toHaveLength(2);
  });

  it("switches main image when clicking a thumbnail button", () => {
    const { container } = render(<ProductGallery images={mockImages} productName="Sample Product" />);
    const secondThumb = screen.getByRole("button", { name: "View product image 2" });
    fireEvent.click(secondThumb);

    const mainImg = container.querySelector(".mainImage img");
    expect(mainImg).toBeInTheDocument();
    expect(mainImg).toHaveAttribute("src", "https://images.unsplash.com/photo-2");
  });
});
