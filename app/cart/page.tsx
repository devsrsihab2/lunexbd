import type { Metadata } from "next";
import { CartSummary } from "@/components/cart/CartSummary";
import { ErrorState } from "@/components/ui/ErrorState";
import { getCart } from "@/services/api/cart.api";
import { createMetadata } from "@/utils/seo";
import styles from "./cart.module.scss";

export const metadata: Metadata = createMetadata({ title: "Cart", path: "/cart", robots: "noindex,nofollow" });

export default async function CartPage() {
  const cart = await getCart();
  return <main className={styles.page}><div className={styles.inner}>{!cart.success ? <ErrorState message={cart.message} retryHref="/cart" /> : <CartSummary cart={cart.data} />}</div></main>;
}
