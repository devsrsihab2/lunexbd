import Link from "next/link";
import Image from "next/image";
import { Price } from "@/components/ui/Price";
import type { Product } from "@/types/product.types";
import { ProductCardActions } from "./ProductCardActions";
import { WishlistButton } from "./WishlistButton";
import styles from "./ProductCard.module.scss";

function shouldUseOptimizer(src: string) {
  return (
    src.startsWith("/") ||
    src.startsWith("https://images.unsplash.com") ||
    src.startsWith("https://storage.googleapis.com")
  );
}

export function ProductCard({ product, variant = "default" }: { product: Product; variant?: "default" | "listing" }) {
  const image = product.images?.find((item) => item.src);
  const productHref = `/product/${product.slug}`;

  const regularPrice = Number(product.regularPrice);
  const salePrice = Number(product.salePrice);

  const hasSale =
    Boolean(product.salePrice && product.regularPrice) &&
    Number.isFinite(salePrice) &&
    Number.isFinite(regularPrice) &&
    regularPrice > 0 &&
    salePrice < regularPrice;

  const discount = hasSale
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  return (
    <article className={`${styles.card} ${variant === "listing" ? styles.listingCard : ""}`}>
      <div className={styles.media}>
        {hasSale ? (
          <span className={styles.ribbon}>-{discount}% Off!</span>
        ) : null}

        <WishlistButton productId={product.id} productName={product.name} />

        <Link className={styles.imageLink} href={productHref}>
          {image?.src ? (
            <Image
              src={image.thumbnail || image.src}
              alt={image.alt || product.name}
              fill
              sizes={
                variant === "listing"
                  ? "(max-width: 575px) 50vw, (max-width: 991px) 33vw, 25vw"
                  : "(max-width: 575px) 50vw, (max-width: 991px) 25vw, 16vw"
              }
              unoptimized={!shouldUseOptimizer(image.thumbnail || image.src)}
            />
          ) : (
            <span className={styles.noImage}>No image</span>
          )}
        </Link>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={productHref}>{product.name}</Link>
        </h3>

        <div className={styles.priceRow}>
          <strong>
            <Price value={product.salePrice || product.price} />
          </strong>

          {hasSale ? (
            <del>
              <Price value={product.regularPrice} />
            </del>
          ) : null}
        </div>

        <span className={styles.stock}>
          {product.stockStatus || "In stock"}
        </span>
      </div>

      <ProductCardActions product={product} />
    </article>
  );
}
