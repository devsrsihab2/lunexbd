import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    provider: string;
  }>;
};

const allowedProviders = ["google", "facebook"];

function getWpBaseUrl() {
  const baseUrl =
    process.env.WP_BASE_URL ||
    process.env.NEXT_PUBLIC_WP_BASE_URL ||
    process.env.WORDPRESS_URL ||
    process.env.NEXT_PUBLIC_WORDPRESS_URL;

  return baseUrl?.replace(/\/+$/, "") || "";
}

function safeRedirectPath(value: string | null) {
  if (!value) return "/account";

  try {
    const decoded = decodeURIComponent(value);

    if (!decoded.startsWith("/") || decoded.startsWith("//")) {
      return "/account";
    }

    return decoded;
  } catch {
    return "/account";
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;

  if (!allowedProviders.includes(provider)) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid social login provider", request.url),
    );
  }

  const wpBaseUrl = getWpBaseUrl();

  if (!wpBaseUrl) {
    return NextResponse.redirect(
      new URL("/login?error=WP_BASE_URL is not configured", request.url),
    );
  }

  const redirect = safeRedirectPath(
    request.nextUrl.searchParams.get("redirect"),
  );

  const callbackUrl = new URL("/login", request.nextUrl.origin);
  callbackUrl.searchParams.set("redirect", redirect);

  const targetUrl = new URL(`${wpBaseUrl}/wp-json/lunex/v1/auth/${provider}`);

  targetUrl.searchParams.set("redirect", redirect);
  targetUrl.searchParams.set("callback", callbackUrl.toString());

  return NextResponse.redirect(targetUrl);
}
