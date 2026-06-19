"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ProductImage } from "@/types/product.types";
import styles from "./ProductGallery.module.scss";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

function shouldUseOptimizer(src: string) {
  return (
    src.startsWith("/") ||
    src.startsWith("https://images.unsplash.com") ||
    src.startsWith("https://storage.googleapis.com")
  );
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const galleryImages = useMemo(
    () => images.filter((image) => Boolean(image.src)),
    [images],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex];

  if (!galleryImages.length) {
    return (
      <div className={styles.gallery}>
        <div className={styles.thumbnails} aria-label="Product gallery images">
          <div className={styles.emptyThumb} aria-hidden="true" />
        </div>

        <div className={styles.emptyImage}>
          <span>No image</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.thumbnails} aria-label="Product gallery images">
        {galleryImages.map((image, index) => (
          <button
            className={`${styles.thumbnail} ${
              activeIndex === index ? styles.activeThumbnail : ""
            }`}
            key={`${image.src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`View product image ${index + 1}`}
          >
            <Image
              src={image.thumbnail || image.src}
              alt={image.alt || productName}
              fill
              sizes="72px"
              unoptimized={!shouldUseOptimizer(image.thumbnail || image.src)}
            />

            {activeIndex === index ? (
              <span className={styles.check} aria-hidden="true">
                ✓
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className={styles.mainImage}>
        <Image
          src={activeImage.src}
          alt={activeImage.alt || productName}
          fill
          priority
          sizes="(max-width: 1080px) 100vw, 56vw"
          unoptimized={!shouldUseOptimizer(activeImage.src)}
        />
      </div>
    </div>
  );
}
