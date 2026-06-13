import type { Metadata } from "next";
import { AuthForm } from "@/app/(auth)/AuthForm";
import { createMetadata } from "@/utils/seo";

export const metadata: Metadata = createMetadata({ title: "Register", path: "/register", robots: "noindex,nofollow" });

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const params = await searchParams;
  const redirectTo = typeof params.redirect === "string" ? params.redirect : "/account";

  return <AuthForm mode="register" redirectTo={redirectTo} />;
}
