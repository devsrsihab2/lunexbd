// app/account/reviews/page.tsx
import type { Metadata } from "next";
import { AccountReviewsView } from "../AccountDashboard";
import { createMetadata } from "@/utils/seo";

export const metadata: Metadata = createMetadata({
  title: "Reviews",
  path: "/account/reviews",
  robots: "noindex,nofollow",
});

export default function ReviewsPage() {
  return <AccountReviewsView />;
}
