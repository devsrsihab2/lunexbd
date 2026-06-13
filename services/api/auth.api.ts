import { storefrontProxy } from "./http";
import type { User } from "@/types/user.types";

export function login(payload: { username: string; password: string; remember?: boolean }) {
  return storefrontProxy<User>("/auth/login", { method: "POST", body: payload });
}

export function register(payload: unknown) {
  return storefrontProxy<User>("/auth/register", { method: "POST", body: payload });
}

export function requestPasswordReset(payload: { email: string }) {
  return storefrontProxy<{ sent: boolean }>("/auth/forgot-password", { method: "POST", body: payload });
}

export function logout() {
  return storefrontProxy<{ loggedOut: boolean }>("/auth/logout", { method: "POST", auth: true });
}

export function getMe() {
  return storefrontProxy<User>("/me", { cache: "no-store", auth: true });
}

export function updateMe(payload: Partial<Pick<User, "firstName" | "lastName" | "email" | "phone">>) {
  return storefrontProxy<User>("/me", { method: "PUT", body: payload, auth: true });
}

export function updatePassword(payload: { currentPassword: string; password: string; confirmPassword: string }) {
  return storefrontProxy<User>("/me/password", { method: "POST", body: payload, auth: true });
}
