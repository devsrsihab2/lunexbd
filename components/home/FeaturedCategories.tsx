"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FeaturedCategory } from "@/types/content.types";
import styles from "./FeaturedCategories.module.scss";

function shouldUseOptimizer(src: string) {
  return (
    src.startsWith("/") ||
    src.includes("storage.googleapis.com") ||
    src.includes("images.unsplash.com")
  );
}

function getVisibleItems() {
  if (typeof window === "undefined") return 7;

  if (window.innerWidth >= 1200) return 7;
  if (window.innerWidth >= 992) return 6;
  if (window.innerWidth >= 768) return 5;
  if (window.innerWidth >= 576) return 4;

  return 3;
}

function categoryHref(category: FeaturedCategory) {
  return `/category/${category.slug}`;
}

export function FeaturedCategories({
  categories,
  title = "Featured Categories",
}: {
  categories: FeaturedCategory[];
  title?: string;
}) {
  const items = useMemo(
    () => categories.filter((category) => category.image),
    [categories],
  );

  const railRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const [canSlide, setCanSlide] = useState(false);
  const [visibleItems, setVisibleItems] = useState(7);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const update = () => {
      const visible = getVisibleItems();

      setVisibleItems(visible);
      setCanSlide(items.length > visible);
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, [items.length]);

  useEffect(() => {
    if (!canSlide || isDragging) return;

    const timer = window.setInterval(() => {
      const rail = railRef.current;
      if (!rail) return;

      const firstCard = rail.querySelector<HTMLElement>(`.${styles.card}`);
      if (!firstCard) return;

      const railStyle = window.getComputedStyle(rail);
      const gap = parseFloat(railStyle.columnGap || railStyle.gap || "0");
      const step = firstCard.offsetWidth + gap;
      const maxScroll = rail.scrollWidth - rail.clientWidth;

      if (rail.scrollLeft + step >= maxScroll - 2) {
        rail.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        rail.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3200);

    return () => window.clearInterval(timer);
  }, [canSlide, isDragging]);

  if (!items.length) {
    return null;
  }

  const slide = (direction: "prev" | "next") => {
    const rail = railRef.current;
    if (!rail) return;

    const firstCard = rail.querySelector<HTMLElement>(`.${styles.card}`);
    if (!firstCard) return;

    const railStyle = window.getComputedStyle(rail);
    const gap = parseFloat(railStyle.columnGap || railStyle.gap || "0");
    const step = firstCard.offsetWidth + gap;
    const maxScroll = rail.scrollWidth - rail.clientWidth;

    if (direction === "next") {
      if (rail.scrollLeft + step >= maxScroll - 2) {
        rail.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        rail.scrollBy({ left: step, behavior: "smooth" });
      }

      return;
    }

    if (rail.scrollLeft - step <= 0) {
      rail.scrollTo({ left: maxScroll, behavior: "smooth" });
    } else {
      rail.scrollBy({ left: -step, behavior: "smooth" });
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail) return;
    if (event.target instanceof Element && event.target.closest("a")) return;

    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    setIsDragging(true);

    startXRef.current = event.clientX;
    scrollLeftRef.current = rail.scrollLeft;

    rail.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !isDraggingRef.current) return;

    const walk = event.clientX - startXRef.current;
    dragDistanceRef.current = Math.abs(walk);
    rail.scrollLeft = scrollLeftRef.current - walk;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail) return;

    isDraggingRef.current = false;
    setIsDragging(false);

    if (rail.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
  };

  const handleCardClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (dragDistanceRef.current > 6) {
      event.preventDefault();
      event.stopPropagation();
      dragDistanceRef.current = 0;
      return;
    }

    dragDistanceRef.current = 0;
  };

  return (
    <section className={styles.section} aria-labelledby="featured-categories">
      <h2 id="featured-categories" className={styles.title}>
        {title}
      </h2>

      <div className={styles.sliderWrap}>
        {canSlide ? (
          <button
            type="button"
            className={`${styles.navButton} ${styles.prevButton}`}
            aria-label="Previous categories"
            onClick={() => slide("prev")}
          >
            ‹
          </button>
        ) : null}

        <div
          ref={railRef}
          className={`${styles.rail} ${!canSlide ? styles.centered : ""} ${
            isDragging ? styles.dragging : ""
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={
            {
              "--visible-items": visibleItems,
            } as React.CSSProperties
          }
        >
          {items.map((category) => (
            <Link
              key={category.id}
              href={categoryHref(category)}
              className={styles.card}
              draggable={false}
              onClick={handleCardClick}
            >
              <span className={styles.imageBox}>
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1200px) 170px, (min-width: 768px) 140px, 105px"
                  unoptimized={!shouldUseOptimizer(category.image)}
                  draggable={false}
                />
              </span>

              <strong>{category.name}</strong>
            </Link>
          ))}
        </div>

        {canSlide ? (
          <button
            type="button"
            className={`${styles.navButton} ${styles.nextButton}`}
            aria-label="Next categories"
            onClick={() => slide("next")}
          >
            ›
          </button>
        ) : null}
      </div>
    </section>
  );
}
