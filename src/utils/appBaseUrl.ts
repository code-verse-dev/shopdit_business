import { PUBLIC_URL } from "../constants/api";

/** Origin + app basename (e.g. https://host/shopdit-business) for Stripe Connect redirect URLs. */
export function getAppBaseUrl(): string {
  const normalized = (PUBLIC_URL ?? "").replace(/\/$/, "");
  return `${window.location.origin}${normalized}`;
}
