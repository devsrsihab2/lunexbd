import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { getCheckoutOptions } from "@/services/api/checkout.api";
import { getProductById } from "@/services/api/products.api";
import type { CheckoutLineItem } from "@/types/checkout.types";
import type { Product } from "@/types/product.types";
import { createMetadata } from "@/utils/seo";
import styles from "./checkout.module.scss";

export const metadata: Metadata = createMetadata({
  title: "Checkout",
  path: "/checkout",
  robots: "noindex,nofollow",
});

function getVariationPrice(product: Product, variationId?: number) {
  if (!variationId || !product.variations?.length) {
    return {
      price: product.salePrice || product.price || "0",
      image: product.images?.[0]?.src,
    };
  }

  const variation = product.variations.find((item) => item.id === variationId);

  return {
    price:
      variation?.salePrice ||
      variation?.price ||
      product.salePrice ||
      product.price ||
      "0",
    image: variation?.image?.src || product.images?.[0]?.src,
  };
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const productId = query.productId ? Number(query.productId) : 0;
  const variationId = query.variationId ? Number(query.variationId) : undefined;
  const quantity = Math.max(1, Number(query.quantity || 1));

  const [options, productResponse] = await Promise.all([
    getCheckoutOptions(),
    productId ? getProductById(productId) : Promise.resolve(null),
  ]);

  const selectedProduct = productResponse?.success
    ? productResponse.data
    : null;
  const selectedPrice = selectedProduct
    ? getVariationPrice(selectedProduct, variationId)
    : null;

  const buyNowItem: CheckoutLineItem | null =
    selectedProduct && selectedPrice
      ? {
          productId: selectedProduct.id,
          variationId,
          name: selectedProduct.name,
          quantity,
          price: selectedPrice.price,
          image: selectedPrice.image,
        }
      : null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Checkout</h1>
        <p>Home &gt; Checkout</p>
      </header>

      <div className={styles.inner}>
        {!options.success ? (
          <ErrorState message={options.message} retryHref="/checkout" />
        ) : (
          <CheckoutForm
            options={options.data}
            initialItems={buyNowItem ? [buyNowItem] : []}
            loadCart={!buyNowItem}
          />
        )}
      </div>
    </main>
  );
}
