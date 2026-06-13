import { EmptyState } from "@/components/ui/EmptyState";
import type { Product } from "@/types/product.types";
import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.scss";

export function ProductGrid({ products, variant = "default" }: { products?: Product[] | null; variant?: "default" | "listing" }) {
  if (!products?.length) {
    return <EmptyState title="No products found" message="Try changing filters or browse the latest products." actionHref="/products" actionLabel="Browse products" />;
  }

  return (
    <div className={`${styles.grid} ${variant === "listing" ? styles.listing : ""}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant={variant} />
      ))}
    </div>
  );
}
