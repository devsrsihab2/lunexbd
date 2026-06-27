/**
 * ProductCard.test.tsx
 *
 * Tests the ProductCard component:
 * - Renders basic product name, image link, prices, stock status
 * - Renders sale badge with discount percentage when product is on sale
 * - Renders fallback "No image" text if no product images are available
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/product.types";

// ── Mocks ──────────────────────────────────────────────────────────────────

// Mock next/image to render standard img tag without warnings
jest.mock("next/image", () => {
  return function MockImage({ src, alt, priority, fill, unoptimized, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock WishlistButton and ProductCardActions
jest.mock("@/components/product/WishlistButton", () => ({
  WishlistButton: () => <div data-testid="wishlist-btn" />,
}));

jest.mock("@/components/product/ProductCardActions", () => ({
  ProductCardActions: () => <div data-testid="card-actions" />,
}));

jest.mock("@/components/ui/Price", () => ({
  Price: ({ value }: { value: string | number }) => <span>৳ {value}</span>,
}));

jest.mock("@/components/product/ProductCard.module.scss", () => ({
  card: "card",
  listingCard: "listingCard",
  media: "media",
  ribbon: "ribbon",
  imageLink: "imageLink",
  noImage: "noImage",
  body: "body",
  title: "title",
  priceRow: "priceRow",
  stock: "stock",
}));

const mockProductSimple: Product = {
  id: 1,
  name: "Leather Wallet",
  slug: "leather-wallet",
  type: "simple",
  price: "250",
  regularPrice: "250",
  salePrice: "",
  stockStatus: "In stock",
  images: [{ src: "/wallet.jpg", alt: "Wallet", thumbnail: "/wallet-thumb.jpg" }],
} as unknown as Product;

const mockProductOnSale: Product = {
  id: 2,
  name: "Travel Backpack",
  slug: "travel-backpack",
  type: "simple",
  price: "800",
  regularPrice: "1000",
  salePrice: "800",
  stockStatus: "In stock",
  images: [],
} as unknown as Product;

describe("ProductCard component", () => {
  it("renders simple product title, prices, image, and action elements", () => {
    render(<ProductCard product={mockProductSimple} />);
    expect(screen.getByRole("heading", { name: "Leather Wallet" })).toBeInTheDocument();
    expect(screen.getByText("In stock")).toBeInTheDocument();
    expect(screen.getByTestId("wishlist-btn")).toBeInTheDocument();
    expect(screen.getByTestId("card-actions")).toBeInTheDocument();

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/wallet-thumb.jpg");
  });

  it("renders sale badge and discount % when product is on sale", () => {
    render(<ProductCard product={mockProductOnSale} />);
    // regular price is 1000, sale price is 800 -> discount = 20%
    expect(screen.getByText("-20% Off!")).toBeInTheDocument();
    expect(screen.getByText("৳ 800")).toBeInTheDocument();
    expect(screen.getByText("৳ 1000")).toBeInTheDocument();
  });

  it("renders fallback text when no image is available", () => {
    render(<ProductCard product={mockProductOnSale} />);
    expect(screen.getByText("No image")).toBeInTheDocument();
  });
});
