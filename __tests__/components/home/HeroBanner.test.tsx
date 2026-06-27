/**
 * HeroBanner.test.tsx
 *
 * Tests the HeroBanner component:
 * - Renders main title, subtitle, and CTA link
 * - Utilizes custom banners when provided, otherwise defaults to fallback banner
 * - Renders assurance columns
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { HeroBanner } from "@/components/home/HeroBanner";
import type { HomeBanner } from "@/types/content.types";

jest.mock("@/components/home/BannerSlider", () => ({
  BannerSlider: () => <div data-testid="banner-slider" />,
}));

jest.mock("@/components/home/HeroBanner.module.scss", () => ({
  heroWrap: "heroWrap",
  hero: "hero",
  copy: "copy",
  script: "script",
  divider: "divider",
  lead: "lead",
  cta: "cta",
  assurance: "assurance",
  art: "art",
  archOne: "archOne",
  archTwo: "archTwo",
}));

const customBanners: HomeBanner[] = [
  {
    title: "Custom Title",
    subtitle: "Custom Subtitle",
    image: "/custom.png",
    href: "/custom-shop",
    buttonText: "Custom Shop",
  },
];

describe("HeroBanner component", () => {
  it("renders with fallback details when no banners provided", () => {
    render(<HeroBanner banners={undefined} />);
    expect(screen.getByRole("heading", { name: "Made for every moment" })).toBeInTheDocument();
    expect(screen.getByText("Premium quality. Timeless style. Bags for every occasion.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop Now" })).toHaveAttribute("href", "/products");
  });

  it("renders with custom banner details", () => {
    render(<HeroBanner banners={customBanners} />);
    expect(screen.getByRole("heading", { name: "Custom Title" })).toBeInTheDocument();
    expect(screen.getByText("Custom Subtitle")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Custom Shop" })).toHaveAttribute("href", "/custom-shop");
  });

  it("renders shopping assurance highlights", () => {
    render(<HeroBanner banners={undefined} />);
    expect(screen.getByText("Premium Quality")).toBeInTheDocument();
    expect(screen.getByText("Easy Returns")).toBeInTheDocument();
    expect(screen.getByText("Secure Payment")).toBeInTheDocument();
  });
});
