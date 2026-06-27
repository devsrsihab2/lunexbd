/**
 * BannerSlider.test.tsx
 *
 * Tests the BannerSlider component:
 * - Renders a skeleton when image slides list is empty
 * - Renders slides & dots when banners lists are not empty
 * - Rotates active slides inside useEffect timers
 */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BannerSlider } from "@/components/home/BannerSlider";
import type { HomeBanner } from "@/types/content.types";

jest.mock("next/image", () => {
  return function MockImage({ src, alt, priority, fill, unoptimized, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock("@/components/home/HeroBanner.module.scss", () => ({
  heroSkeleton: "heroSkeleton",
  slider: "slider",
  slideTrack: "slideTrack",
  slide: "slide",
  dots: "dots",
  activeDot: "activeDot",
}));

const mockBanners: HomeBanner[] = [
  { image: "/slider1.jpg", title: "Slide One", href: "/category1" },
  { image: "/slider2.jpg", title: "Slide Two", href: "/category2" },
];

describe("BannerSlider component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders loader skeleton when no images available", () => {
    render(<BannerSlider banners={[]} />);
    expect(screen.getByLabelText("Loading featured banner")).toBeInTheDocument();
  });

  it("renders slides and choosing dots when images are present", () => {
    render(<BannerSlider banners={mockBanners} />);
    expect(screen.getByRole("link", { name: "Slide One" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Slide Two" })).toBeInTheDocument();
    expect(screen.getByLabelText("Choose banner")).toBeInTheDocument();
  });

  it("advances active slide automatically after time threshold", () => {
    const { container } = render(<BannerSlider banners={mockBanners} />);
    const track = container.querySelector(".slideTrack") as HTMLElement;

    // Initially active index is 0 -> translateX(0%)
    expect(track.style.transform).toBe("translateX(-0%)");

    // Advance timer (5200ms)
    act(() => {
      jest.advanceTimersByTime(5200);
    });

    expect(track.style.transform).toBe("translateX(-100%)");
  });

  it("switches slides when clicking dot indicator", () => {
    const { container } = render(<BannerSlider banners={mockBanners} />);
    const track = container.querySelector(".slideTrack") as HTMLElement;

    const dotTwo = screen.getByLabelText("Show banner 2");
    fireEvent.click(dotTwo);

    expect(track.style.transform).toBe("translateX(-100%)");
  });
});
