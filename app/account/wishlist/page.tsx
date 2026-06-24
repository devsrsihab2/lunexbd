import type { Metadata } from "next";
import { AccountWishlistView } from "./AccountWishlistView";
import { createMetadata } from "@/utils/seo";

export const metadata: Metadata = createMetadata({
  title: "Wishlist - Account",
  path: "/account/wishlist",
  robots: "noindex,nofollow",
});

export default function AccountWishlistPage() {
  return <AccountWishlistView />;
}
