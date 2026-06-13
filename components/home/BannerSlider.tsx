"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { HomeBanner } from "@/types/content.types";
import styles from "./HeroBanner.module.scss";
import Link from "next/link";

function shouldUseOptimizer(src: string) {
  return (
    src.startsWith("/") ||
    src.includes("nexilup.test") ||
    src.includes("storage.googleapis.com") ||
    src.includes("images.unsplash.com")
  );
}

export function BannerSlider({ banners }: { banners: HomeBanner[] }) {
  const slides = useMemo(
    () => banners.filter((banner) => banner.image),
    [banners],
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % slides.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return (
      <div
        className={styles.heroSkeleton}
        aria-label="Loading featured banner"
      />
    );
  }

  return (
    <div
      className={styles.slider}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div
        className={styles.slideTrack}
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((banner, index) => (
          <Link
            key={`${banner.image}-${index}`}
            className={styles.slide}
            href={banner.href || "/products"}
            aria-label={banner.title || `Featured banner ${index + 1}`}
          >
            <Image
              src={banner.image || ""}
              alt={banner.title || ""}
              fill
              priority={index === 0}
              sizes="(min-width: 1180px) 55vw, (min-width: 768px) 58vw, 100vw"
              unoptimized={!shouldUseOptimizer(banner.image || "")}
            />
          </Link>
        ))}
      </div>
      {slides.length > 1 ? (
        <div className={styles.dots} aria-label="Choose banner">
          {slides.map((banner, index) => (
            <button
              key={`${banner.image}-dot`}
              type="button"
              className={index === active ? styles.activeDot : undefined}
              aria-label={`Show banner ${index + 1}`}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
