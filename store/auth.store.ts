import { createStore } from "./createStore";
import type { User } from "@/types/user.types";

export const authStore = createStore<{ user: User | null; status: "idle" | "loading" | "authenticated" | "guest" }>({
  user: null,
  status: "idle",
});
