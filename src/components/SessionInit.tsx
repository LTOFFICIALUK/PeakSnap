"use client";

import { useEffect } from "react";

const SESSION_KEY = "peaksnap-session";

const SessionInit = () => {
  useEffect(() => {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) {
      document.cookie = `${SESSION_KEY}=${existing}; path=/; max-age=31536000; samesite=lax`;
      return;
    }

    const id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    document.cookie = `${SESSION_KEY}=${id}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return null;
};

export default SessionInit;
