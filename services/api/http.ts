import type { ApiResponse } from "@/types/api.types";

const wpApiUrl = process.env.NEXT_PUBLIC_WP_API_URL;

type QueryValue = string | number | boolean | null | undefined;

type FetchOptions = Omit<RequestInit, "body"> & {
  query?: Record<string, QueryValue>;
  body?: unknown;
  auth?: boolean;
};

const STORE_NONCE_KEY = "lunex_store_nonce";
const STORE_CART_TOKEN_KEY = "lunex_store_cart_token";

function appendQuery(url: string, query?: FetchOptions["query"]) {
  const params = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  if (!queryString) return url;

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

function buildUrl(path: string, query?: FetchOptions["query"]) {
  if (typeof window !== "undefined" && path.startsWith("/lunex/v1/")) {
    return appendQuery(
      `/api/lunex/${path.replace(/^\/lunex\/v1\//, "")}`,
      query,
    );
  }

  if (typeof window !== "undefined" && path.startsWith("/wc/store/v1/")) {
    return appendQuery(
      `/api/store/${path.replace(/^\/wc\/store\/v1\//, "")}`,
      query,
    );
  }

  if (!wpApiUrl) {
    throw new Error("NEXT_PUBLIC_WP_API_URL is missing.");
  }

  const url = new URL(
    path.replace(/^\//, ""),
    `${wpApiUrl.replace(/\/$/, "")}/`,
  );

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function addCacheBuster(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_lunex_no_cache=${Date.now()}`;
}

function shouldBypassHttpCache(path: string, method: string) {
  return ["GET", "HEAD"].includes(method) && (
    path.startsWith("/wc/store/v1/") || path.startsWith("/lunex/v1/")
  );
}

function isStoreApiPath(path: string) {
  return path.startsWith("/wc/store/v1/");
}

function isStoreMutation(path: string, method: string) {
  return isStoreApiPath(path) && !["GET", "HEAD"].includes(method);
}

function getClientToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") || localStorage.getItem("token") || null
  );
}

function getStoreNonce() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(STORE_NONCE_KEY);
}

function getStoreCartToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(STORE_CART_TOKEN_KEY);
}

function clearStoreSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORE_NONCE_KEY);
  localStorage.removeItem(STORE_CART_TOKEN_KEY);
}

function saveStoreHeaders(headers: Headers) {
  if (typeof window === "undefined") return;

  const nonce = headers.get("nonce") || headers.get("Nonce");
  const cartToken = headers.get("cart-token") || headers.get("Cart-Token");

  if (nonce) {
    localStorage.setItem(STORE_NONCE_KEY, nonce);
  }

  if (cartToken) {
    localStorage.setItem(STORE_CART_TOKEN_KEY, cartToken);
  }
}

async function ensureStoreSession(force = false) {
  if (typeof window === "undefined") return;

  if (!force && getStoreNonce()) return;

  const response = await fetch("/api/store/cart", {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  saveStoreHeaders(response.headers);
}

function isJsonBody(body: unknown) {
  return (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer)
  );
}

function createBody(body: unknown) {
  if (body === undefined || body === null) return undefined;

  return isJsonBody(body) ? JSON.stringify(body) : (body as BodyInit);
}

function createHeaders(
  path: string,
  body: unknown,
  auth: boolean,
  customHeaders?: HeadersInit,
) {
  const headers = new Headers();

  headers.set("Accept", "application/json");

  if (isJsonBody(body)) {
    headers.set("Content-Type", "application/json");
  }

  const token = auth ? getClientToken() : null;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (typeof window !== "undefined" && isStoreApiPath(path)) {
    const nonce = getStoreNonce();
    const cartToken = getStoreCartToken();

    if (nonce) {
      headers.set("Nonce", nonce);
    }

    if (cartToken) {
      headers.set("Cart-Token", cartToken);
    }
  }

  if (customHeaders) {
    new Headers(customHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  headers.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");

  return headers;
}

async function executeRequest<T>(
  path: string,
  options: FetchOptions,
  requestMethod: string,
): Promise<ApiResponse<T>> {
  const {
    query,
    body,
    headers,
    credentials = "include",
    auth = false,
    ...restOptions
  } = options;

  const requestUrl = shouldBypassHttpCache(path, requestMethod)
    ? addCacheBuster(buildUrl(path, query))
    : buildUrl(path, query);

  const response = await fetch(requestUrl, {
    ...restOptions,
    method: requestMethod,
    cache: shouldBypassHttpCache(path, requestMethod) ? "no-store" : restOptions.cache,
    credentials,
    headers: createHeaders(path, body, auth, headers),
    body: createBody(body),
  });

  saveStoreHeaders(response.headers);

  const responseHeaders = Object.fromEntries(response.headers.entries());
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  const responseBody = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    return {
      success: false,
      data: null as T,
      message:
        responseBody?.message ||
        responseBody?.error ||
        `Request failed with status ${response.status}`,
      errors: responseBody?.errors,
      status: response.status,
      headers: responseHeaders,
    };
  }

  if (responseBody?.success !== undefined) {
    const total = Number(responseHeaders["x-wp-total"] || 0);
    const totalPages = Number(responseHeaders["x-wp-totalpages"] || 0);
    const page = Number(responseHeaders["x-wp-page"] || options.query?.page || 1);

    return {
      ...responseBody,
      status: response.status,
      headers: responseHeaders,
      pagination: totalPages
        ? {
            page,
            perPage: Array.isArray(responseBody.data) ? responseBody.data.length : 0,
            total,
            totalPages,
          }
        : responseBody.pagination,
    };
  }

  return {
    success: true,
    data: responseBody as T,
    status: response.status,
    headers: responseHeaders,
  };
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const requestMethod = (options.method || "GET").toUpperCase();

  try {
    if (typeof window !== "undefined" && isStoreMutation(path, requestMethod)) {
      await ensureStoreSession();
    }

    let result = await executeRequest<T>(path, options, requestMethod);

    const nonceMissing =
      result.status === 403 &&
      typeof result.message === "string" &&
      result.message.toLowerCase().includes("nonce");

    if (
      typeof window !== "undefined" &&
      isStoreMutation(path, requestMethod) &&
      nonceMissing
    ) {
      clearStoreSession();
      await ensureStoreSession(true);
      result = await executeRequest<T>(path, options, requestMethod);
    }

    return result;
  } catch (error) {
    return {
      success: false,
      data: null as T,
      message:
        error instanceof Error
          ? error.message
          : "Unable to connect to the store service.",
    };
  }
}

export async function storefrontProxy<T>(
  path: string,
  options: FetchOptions = {},
) {
  return apiFetch<T>(`/lunex/v1/${path.replace(/^\//, "")}`, options);
}
