import Cookies from "js-cookie";

const TOKEN_KEY = "agewell_auth_token";
const USER_KEY = "agewell_auth_user";

export function getAuthToken(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || undefined;
}

export function setAuthToken(token: string, expiresDays: number = 7): void {
  if (typeof window === "undefined") return;
  Cookies.set(TOKEN_KEY, token, {
    expires: expiresDays,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  Cookies.remove(TOKEN_KEY, { path: "/" });
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

export function clearAuthSession(): void {
  removeAuthToken();
  removeStoredUser();
}
