import type { Metadata } from "next";
import { AccountDashboard } from "./AccountDashboard";
import { createMetadata } from "@/utils/seo";

export const metadata: Metadata = createMetadata({ title: "Account", path: "/account", robots: "noindex,nofollow" });

export default function AccountPage() {
  return <AccountDashboard />;
}
