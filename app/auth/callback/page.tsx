"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function safeRedirectPath(path?: string | null) {
  if (!path) return "/account";

  try {
    const decoded = decodeURIComponent(path);

    if (!decoded.startsWith("/") || decoded.startsWith("//")) {
      return "/account";
    }

    return decoded;
  } catch {
    return "/account";
  }
}

function SocialAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("accessToken") || searchParams.get("token") || "";
    const redirectTo = safeRedirectPath(searchParams.get("redirect"));
    const user = searchParams.get("user");
    const error = searchParams.get("error") || searchParams.get("message");

    if (error) {
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("redirect", redirectTo);
      loginUrl.searchParams.set("error", error);
      router.replace(`${loginUrl.pathname}${loginUrl.search}`);
      return;
    }

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
