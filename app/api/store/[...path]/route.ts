import { NextRequest, NextResponse } from "next/server";

const wpBaseUrl = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WP_API_URL;

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function getWpBaseUrl() {
  if (!wpBaseUrl) return null;

  return wpBaseUrl.replace(/\/wp-json\/?$/, "").replace(/\/$/, "");
}

async function getRequestBody(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  return request.text();
}

function copyRequestHeaders(request: NextRequest, body?: string) {
  const headers = new Headers();

  headers.set("Accept", "application/json");

  const contentType = request.headers.get("content-type");
  if (contentType && body !== undefined) {
    headers.set("Content-Type", contentType);
  }

  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const nonce =
    request.headers.get("nonce") ||
    request.headers.get("Nonce") ||
    request.headers.get("x-wp-nonce");

  if (nonce) {
    headers.set("Nonce", nonce);
  }

  const cartToken =
    request.headers.get("cart-token") || request.headers.get("Cart-Token");

  if (cartToken) {
    headers.set("Cart-Token", cartToken);
  }

  return headers;
}

function copyResponseHeaders(response: Response) {
  const headers = new Headers();

  headers.set(
    "Content-Type",
    response.headers.get("content-type") || "application/json",
  );

  const passthroughHeaders = [
    "x-wp-total",
    "x-wp-totalpages",
    "x-wp-page",
    "nonce",
    "Nonce",
    "cart-token",
    "Cart-Token",
  ];

  passthroughHeaders.forEach((header) => {
    const value = response.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    headers.set("set-cookie", setCookie);
  }

  return headers;
}

async function proxy(request: NextRequest, context: RouteContext) {
  const baseUrl = getWpBaseUrl();

  if (!baseUrl) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "WP_BASE_URL is not configured.",
      },
      { status: 500 },
    );
  }

  const { path } = await context.params;

  const target = new URL(`/wp-json/wc/store/v1/${path.join("/")}`, baseUrl);

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  const body = await getRequestBody(request);

  try {
    const response = await fetch(target.toString(), {
      method: request.method,
      headers: copyRequestHeaders(request, body),
      body,
      cache: "no-store",
    });

    return new NextResponse(await response.text(), {
      status: response.status,
      headers: copyResponseHeaders(response),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Unable to reach WooCommerce Store API.",
      },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}
