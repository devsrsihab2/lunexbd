"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function SocialAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("accessToken") || searchParams.get("token") || "";
    const redirectTo = searchParams.get("redirect") || "/account";
    const user = searchParams.get("user");

    if (token) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("token", token);
    }

    if (user) {
      try {
        localStorage.setItem("lunex_user", decodeURIComponent(user));
      } catch {
        localStorage.setItem("lunex_user", user);
      }
    }

    window.dispatchEvent(new Event("lunex-auth-change"));
    router.replace(redirectTo);
    router.refresh();
  }, [router, searchParams]);

  return (
    <main style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
      <p>Signing you in...</p>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<main style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>Signing you in...</main>}>
      <SocialAuthCallback />
    </Suspense>
  );
}
