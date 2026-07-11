export const SESSION_KEY = "peaksnap-session";
export const DISPLAY_NAME_KEY = "peaksnap-display-name";

export const getSessionId = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) {
    document.cookie = `${SESSION_KEY}=${existing}; path=/; max-age=31536000; samesite=lax`;
    return existing;
  }

  const id = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, id);
  document.cookie = `${SESSION_KEY}=${id}; path=/; max-age=31536000; samesite=lax`;
  return id;
};

export const getDisplayName = (): string => {
  if (typeof window === "undefined") {
    return "Anon";
  }

  return localStorage.getItem(DISPLAY_NAME_KEY)?.trim() || "Anon";
};

export const setDisplayName = (name: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const trimmed = name.trim().slice(0, 20);
  localStorage.setItem(DISPLAY_NAME_KEY, trimmed || "Anon");
};
