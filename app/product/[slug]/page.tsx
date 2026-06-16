import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/services/api/products.api";
import { getProductReviews } from "@/services/api/reviews.api";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { submitProductReview } from "./actions";
import { ProductPurchase } from "./ProductPurchase";
import { ProductReviewList } from "./ProductReviewList";
import { ProductShare } from "./ProductShare";
import { ProductWishlistAction } from "./ProductWishlistAction";
import { ReviewForm } from "./ReviewForm";
import styles from "./product-detail.module.scss";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = new Set<string>();
  let page = 1;
  let totalPages = 1;

  do {
    const response = await getProducts({
      page: String(page),
      per_page: "100",
      sort: "latest",
    });

    if (!response.success) break;

    response.data.forEach((product) => {
      if (product.slug) slugs.add(product.slug);
    });

    totalPages = response.pagination?.totalPages || page;
    page += 1;
  } while (page <= totalPages);

  return Array.from(slugs).map((slug) => ({ slug }));
}

function getReviewStats(reviews: { rating: number }[], fallbackRating: number) {
  const counts = [0, 0, 0, 0, 0, 0];

  reviews.forEach((review) => {
    const rating = Math.round(Number(review.rating) || 0);

    if (rating >= 1 && rating <= 5) {
      counts[rating] += 1;
    }
  });

  const total = reviews.length;
  const average = total
    ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) /
      total
    : fallbackRating;

  return {
    average,
    total,
    counts,
    recommendedPercent: total
      ? Math.round(
          (reviews.filter((review) => Number(review.rating) >= 4).length /
            total) *
            100,
        )
      : 0,
  };
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

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://lunexbd.com"
  ).replace(/\/$/, "");
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const productResponse = await getProductBySlug(slug);

  if (
    !productResponse.success &&
    productResponse.message?.toLowerCase().includes("not found")
  ) {
    notFound();
  }

  if (!productResponse.success) {
    return (
      <div className="container page-shell">
        <ErrorState
          message={productResponse.message}
          retryHref={`/product/${slug}`}
        />
      </div>
    );
  }

  const product = productResponse.data;

  const [related, reviewsResponse] = await Promise.all([
    getRelatedProducts(product.id),
    getProductReviews(product.id),
  ]);

  const fallbackRating = Number(product.averageRating) || 0;
  const reviews = reviewsResponse.success ? reviewsResponse.data : [];
  const reviewStats = getReviewStats(
    reviews,
    reviews.length ? fallbackRating : 0,
  );
  const rating = reviewStats.average;
  const reviewCount = reviews.length;
  const firstCategory = product.categories?.[0];
  const reviewAction = submitProductReview.bind(null, product.id, product.slug);
  const reviewLoginHref = `/login?redirect=${encodeURIComponent(
    `/product/${product.slug}#reviews`,
  )}`;
  const productUrl = `${getSiteUrl()}/product/${product.slug}`;

  return (
    <main className={styles.page}>
      <div className={styles.breadcrumbWrap}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">&rsaquo;</span>
          <Link href="/products">Products</Link>
          <span aria-hidden="true">&rsaquo;</span>
          <span>{product.name}</span>
        </nav>
      </div>

      <div className={styles.inner}>
        <section className={styles.productShell}>
          <div className={styles.galleryCard}>
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          <aside className={styles.summary}>
            <div className={styles.metaLine}>
              {firstCategory ? <Badge>{firstCategory.name}</Badge> : null}
              <span>{product.stockStatus || "In stock"}</span>
              {product.sku ? <span>SKU: {product.sku}</span> : null}
            </div>

            <h1 className={styles.productTitle}>{product.name}</h1>

            <ProductPurchase product={product} />

            <div className={styles.ratingLine}>
              <span>{rating ? rating.toFixed(1) : "0.0"} average rating</span>
              <span>{reviewCount} reviews</span>
            </div>

            {product.shortDescription ? (
              <div
                className={styles.shortDescription}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(product.shortDescription),
                }}
              />
            ) : null}

            <hr className={styles.divider} />

            <ProductWishlistAction product={product} />

            <div className={styles.quickActions}>
              <a href="https://wa.me/8809642922922">Order on WhatsApp</a>
              <a href="tel:09642922922">Call for order</a>
            </div>

            <ProductShare productName={product.name} productUrl={productUrl} />

            <div className={styles.brandLine}>
              <strong>Brand:</strong>
              <span>Lunexbd</span>
            </div>
          </aside>
        </section>

        <section className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <strong>Safe checkout</strong>
            <span>Order through storefront, WhatsApp, or phone.</span>
          </div>
          <div className={styles.infoCard}>
            <strong>Fresh inventory</strong>
            <span>Stock and pricing come from WooCommerce.</span>
          </div>
          <div className={styles.infoCard}>
            <strong>Fast support</strong>
            <span>Questions before buying? Call or message us.</span>
          </div>
        </section>

        <section className={styles.productTabs} aria-label="Product content">
          <a href="#description">Description</a>
          <a href="#reviews">Customer Reviews ({reviewCount})</a>
        </section>

        <section className={styles.descriptionPanel} id="description">
          <div className={styles.panel}>
            <h2>Product Details</h2>

            <div
              className={styles.description}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(
                  product.description || product.shortDescription || "",
                ),
              }}
            />

            {product.attributes?.length ? (
              <>
                <h3>Product information</h3>
                <div className={styles.description}>
                  <ul>
                    {product.attributes.map((attribute) => (
                      <li key={attribute.name}>
                        <strong>{attribute.name}:</strong>{" "}
                        {attribute.options.join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        </section>

        <section className={styles.reviewPanel} id="reviews">
          <div className={styles.reviewSummary}>
            <div className={styles.ratingSummary}>
              <div className={styles.score}>
                <strong>{rating.toFixed(1)}</strong>
                <span>Average Rating</span>
                <small>({reviewCount} Reviews)</small>
              </div>

              <div className={styles.bars}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div className={styles.bar} key={star}>
                    <Stars value={star} />
                    <span className={styles.track}>
                      <span
                        className={styles.fill}
                        style={{
                          width: reviewStats.total
                            ? `${Math.round(
                                (reviewStats.counts[star] / reviewStats.total) *
                                  100,
                              )}%`
                            : "0%",
                        }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.recommendation}>
              <strong>{reviewStats.counts[5] + reviewStats.counts[4]}</strong>
              <span>
                Recommended ({reviewStats.counts[5] + reviewStats.counts[4]} of{" "}
                {reviewCount || 0})
              </span>
            </div>
          </div>

          <ReviewForm action={reviewAction} loginHref={reviewLoginHref} />
        </section>

        <ProductReviewList reviews={reviews} />

        <section className={styles.related}>
          <h2>Related products</h2>
          <ProductGrid products={related.success ? related.data : []} />
        </section>
      </div>
    </main>
  );
}
