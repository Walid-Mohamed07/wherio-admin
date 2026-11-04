export const ADMIN_TOKEN_COOKIE = "wherio_admin_token";
export const ADMIN_TOKEN_STORAGE = "wherio_admin_token";
export const ADMIN_USER_STORAGE = "wherio_admin_user";
export const ADMIN_KEY_STORAGE = "wherio_admin_key";

export interface AdminUserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: "AE" | "SA" | "EG";
  role:
    | "SUPER_ADMIN"
    | "CONTENT_EDITOR"
    | "MODERATOR"
    | "MERCHANT_ADMIN"
    | "CUSTOMER";
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isSuspended?: boolean;
  department?: string;
  createdAt: string;
}

const RAW_ADMIN_API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:4000/api/v1"
)
  .trim()
  .replace(/\/+$/, "");

export const ADMIN_API_BASE = RAW_ADMIN_API_BASE.endsWith("/api/v1")
  ? RAW_ADMIN_API_BASE
  : `${RAW_ADMIN_API_BASE}/api/v1`;

export function saveAdminSession(
  token: string,
  user: AdminUserProfile,
  adminKey?: string,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_TOKEN_STORAGE, token);
  window.localStorage.setItem(ADMIN_USER_STORAGE, JSON.stringify(user));
  if (adminKey && adminKey.trim()) {
    window.localStorage.setItem(ADMIN_KEY_STORAGE, adminKey.trim());
  }
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${ADMIN_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE);
  window.localStorage.removeItem(ADMIN_USER_STORAGE);
  document.cookie = `${ADMIN_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getStoredAdminToken(): string {
  if (typeof window === "undefined") return "";
  return (window.localStorage.getItem(ADMIN_TOKEN_STORAGE) || "").trim();
}

export function getStoredAdminUser(): AdminUserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_USER_STORAGE);
    return raw ? (JSON.parse(raw) as AdminUserProfile) : null;
  } catch {
    return null;
  }
}

export function getStoredAdminKey(): string {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(ADMIN_KEY_STORAGE);
    if (saved && saved.trim()) return saved.trim();
  }
  return (
    process.env.NEXT_PUBLIC_ADMIN_API_KEY ||
    process.env.ADMIN_API_KEY ||
    ""
  ).trim();
}
