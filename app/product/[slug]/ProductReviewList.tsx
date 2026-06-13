"use client";

import { useState } from "react";
import type { ProductReview } from "@/types/product.types";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import styles from "./product-detail.module.scss";

const REVIEWS_PER_PAGE = 4;

type ProductReviewListProps = {
  reviews: ProductReview[];
};

export function ProductReviewList({ reviews }: ProductReviewListProps) {
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  if (!reviews.length) {
    return (
      <div className={styles.reviewEmpty}>
        <strong>No reviews yet</strong>
        <span>Be the first customer to share your experience.</span>
      </div>
    );
  }

  return (
    <div className={styles.reviewListWrap}>
      <div className={styles.reviewListHeading}>
        <div>
          <span>Customer Reviews</span>
          <strong>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</strong>
        </div>
      </div>

      <div className={styles.reviewList}>
        {visibleReviews.map((review) => (
          <article className={styles.reviewItem} key={review.id}>
            <div className={styles.reviewItemHead}>
              <span className={styles.reviewAvatar} aria-hidden="true">
                {getInitials(review.reviewer)}
              </span>
              <div>
                <strong>{review.reviewer}</strong>
                <span>{formatReviewDate(review.dateCreated)}</span>
              </div>
              <div className={styles.reviewRating}>
                <Stars value={review.rating} />
                <small>{review.rating.toFixed(1)}</small>
              </div>
            </div>
            <p
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(review.review),
              }}
            />
          </article>
        ))}
      </div>

      {hasMore ? (
        <button
          className={styles.reviewLoadMore}
          type="button"
          onClick={() => setVisibleCount((current) => current + REVIEWS_PER_PAGE)}
        >
          Load more reviews
        </button>
      ) : null}
    </div>
  );
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);

  return (
    <span className={styles.stars} aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          className={star <= rounded ? styles.starFilled : styles.starMuted}
          key={star}
          aria-hidden="true"
        >
          &#9733;
        </span>
      ))}
    </span>
  );
}

function getInitials(name?: string) {
  const parts = (name || "Customer")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "C";
}

function formatReviewDate(value?: string) {
  if (!value) return "Recently";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
