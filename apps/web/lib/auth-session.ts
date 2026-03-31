import type { AuthResponseData } from "@/lib/api";

const AUTH_CHANGE_EVENT = "orderly-auth-change";
const TOKEN_KEY = "token";
const TOKEN_COOKIE = "orderly_token";
const ROLE_COOKIE = "orderly_role";

function isBrowser() {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function clearCookie(name: string) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function dispatchAuthChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function persistSession(data: AuthResponseData) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  setCookie(TOKEN_COOKIE, data.token);
  setCookie(ROLE_COOKIE, data.role);
  dispatchAuthChange();
}

export function clearStoredSession() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  clearCookie(TOKEN_COOKIE);
  clearCookie(ROLE_COOKIE);
  dispatchAuthChange();
}

export function getStoredToken() {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function subscribeToAuthChanges(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
