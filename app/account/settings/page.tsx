import type { Metadata } from "next";
import { AccountSettingsView } from "../AccountDashboard";
import { createMetadata } from "@/utils/seo";

export const metadata: Metadata = createMetadata({ title: "Account Settings", path: "/account/settings", robots: "noindex,nofollow" });

export default function AccountSettingsPage() {
  return <AccountSettingsView />;
}
