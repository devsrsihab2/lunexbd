import { apiFetch } from "./http";
import type { ApiResponse } from "@/types/api.types";

export interface SavedAddress {
  type: "home" | "office";
  label: string;
  addressLine: string;
  district: string;
  thana: string;
  postalCode: string;
  country: string;
}

export async function getAddresses(): Promise<ApiResponse<SavedAddress[]>> {
  return apiFetch<SavedAddress[]>("/lunex/v1/me/addresses", {
    auth: true,
    cache: "no-store",
  });
}

export async function saveAddress(
  payload: Omit<SavedAddress, "label">,
): Promise<ApiResponse<SavedAddress[]>> {
  return apiFetch<SavedAddress[]>("/lunex/v1/me/addresses", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export async function updateAddress(
  type: "home" | "office",
  payload: Partial<Omit<SavedAddress, "type" | "label">>,
): Promise<ApiResponse<SavedAddress[]>> {
  return apiFetch<SavedAddress[]>(`/lunex/v1/me/addresses/${type}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export async function deleteAddress(
  type: "home" | "office",
): Promise<ApiResponse<SavedAddress[]>> {
  return apiFetch<SavedAddress[]>(`/lunex/v1/me/addresses/${type}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function uploadAvatar(
  file: File,
): Promise<ApiResponse<{ avatarId: number; avatarUrl: string }>> {
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("accessToken") ??
        localStorage.getItem("token") ??
        "")
      : "";

  const formData = new FormData();
  formData.append("avatar", file);

  const wpApiUrl = process.env.NEXT_PUBLIC_WP_API_URL?.replace(/\/$/, "") ?? "";

  const res = await fetch(`${wpApiUrl}/lunex/v1/me/avatar`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    body: formData,
  });

  return res.json();
}

export async function deleteAvatar(): Promise<
  ApiResponse<{ deleted: boolean }>
> {
  return apiFetch<{ deleted: boolean }>("/lunex/v1/me/avatar", {
    method: "DELETE",
    auth: true,
  });
}
