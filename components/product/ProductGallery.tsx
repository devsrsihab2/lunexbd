"use client";

import { useMemo, useState } from "react";
import type { ProductImage } from "@/types/product.types";
import styles from "./ProductGallery.module.scss";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

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
            <img
              src={image.thumbnail || image.src}
              alt={image.alt || productName}
              loading="lazy"
              decoding="async"
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
        <img
          src={activeImage.src}
          alt={activeImage.alt || productName}
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
