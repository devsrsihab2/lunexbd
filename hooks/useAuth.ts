"use client";

import { useSyncExternalStore } from "react";
import { authStore } from "@/store/auth.store";

export function useAuth() {
  return useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getSnapshot);
}
