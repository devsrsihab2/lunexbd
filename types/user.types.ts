import { SavedAddress } from "@/services/api/Addresses.api";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  /** URL of the user's uploaded avatar image (empty string if none) */
  avatarUrl: string;
  /** Saved Home / Office addresses */
  addresses: SavedAddress[];
  accessToken?: string;
  token?: string;
}
