import { NextRequest, NextResponse } from "next/server";

const wpBaseUrl = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WP_API_URL;

function getWpBaseUrl() {
  if (!wpBaseUrl) return null;

  return wpBaseUrl.replace(/\/wp-json\/?$/, "").replace(/\/$/, "");
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const baseUrl = getWpBaseUrl();

  if (!baseUrl) {
    return NextResponse.json({ success: false, data: null, message: "WP_BASE_URL or NEXT_PUBLIC_WP_API_URL is not configured." }, { status: 500 });
  }

  const { path } = await context.params;
  const target = new URL(`/wp-json/lunex/v1/${path.join("/")}`, baseUrl);
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  const headers = new Headers({
    Accept: "application/json",
  });
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");

  if (authorization) headers.set("Authorization", authorization);
  if (cookie) headers.set("Cookie", cookie);
  if (!["GET", "HEAD"].includes(request.method)) headers.set("Content-Type", request.headers.get("content-type") || "application/json");

  const response = await fetch(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
    cache: "no-store",
    redirect: "manual",
  });

  const body = await response.text();
  const responseHeaders = new Headers({
    "Content-Type": response.headers.get("content-type") || "application/json",
  });
  const setCookie = response.headers.get("set-cookie");
  const location = response.headers.get("location");
  if (setCookie) responseHeaders.set("Set-Cookie", setCookie);
  if (location) responseHeaders.set("Location", location);
  ["x-wp-total", "x-wp-totalpages", "x-wp-page"].forEach((header) => {
    const value = response.headers.get(header);
    if (value) responseHeaders.set(header, value);
  });

  return new NextResponse(body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
