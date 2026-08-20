import Cookies from "js-cookie";

const TOKEN_KEY = "agewell_auth_token";
const REFRESH_TOKEN_KEY = "agewell_refresh_token";
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
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getRefreshToken(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return Cookies.get(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
}

export function setRefreshToken(refreshToken: string, expiresDays: number = 30): void {
  if (typeof window === "undefined") return;
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    expires: expiresDays,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function removeRefreshToken(): void {
  if (typeof window === "undefined") return;
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(token: string, refreshToken?: string): void {
  setAuthToken(token);
  if (refreshToken) {
    setRefreshToken(refreshToken);
  }
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
  sessionStorage.removeItem(USER_KEY);
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  
  // Clear all cookies
  Cookies.remove(TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });

  // Clear all local storage auth keys
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  // Clear session storage auth keys
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}


