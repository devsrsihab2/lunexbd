import type { Metadata } from "next";
import { AuthForm } from "@/app/(auth)/AuthForm";
import { createMetadata } from "@/utils/seo";

export const metadata: Metadata = createMetadata({ title: "Login", path: "/login", robots: "noindex,nofollow" });

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const redirectTo = typeof params.redirect === "string" ? params.redirect : "/account";

  return <AuthForm mode="login" redirectTo={redirectTo} />;
}
