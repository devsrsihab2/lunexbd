import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { getCheckoutOptions } from "@/services/api/checkout.api";
import { getProductById } from "@/services/api/products.api";
import { createMetadata } from "@/utils/seo";
import styles from "./checkout.module.scss";

export const metadata: Metadata = createMetadata({ title: "Checkout", path: "/checkout", robots: "noindex,nofollow" });

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const [options, product] = await Promise.all([
    getCheckoutOptions(),
    query.productId ? getProductById(query.productId) : Promise.resolve(null),
  ]);
  const quantity = Math.max(1, Number(query.quantity || 1));
  const selectedProduct = product?.success ? product.data : null;
  const item = selectedProduct
    ? {
        productId: selectedProduct.id,
        variationId: query.variationId ? Number(query.variationId) : selectedProduct.variations?.[0]?.id,
        name: selectedProduct.name,
        quantity,
        price: selectedProduct.salePrice || selectedProduct.price,
        image: selectedProduct.images?.[0]?.src,
      }
    : null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Checkout</h1>
        <p>Home &gt; Checkout</p>
      </header>
      <div className={styles.inner}>
        {!options.success ? <ErrorState message={options.message} retryHref="/checkout" /> : <CheckoutForm options={options.data} item={item} />}
      </div>
    </main>
  );
}
