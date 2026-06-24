// app/account/addresses/page.tsx
import type { Metadata } from "next";
import { AccountAddressesView } from "../AccountDashboard";
import { createMetadata } from "@/utils/seo";

export const metadata: Metadata = createMetadata({
  title: "Addresses",
  path: "/account/addresses",
  robots: "noindex,nofollow",
});

export default function AddressesPage() {
  return <AccountAddressesView />;
}
