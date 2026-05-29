import { useState, useEffect } from "react";

function getInitialDarkMode(): boolean {
  try {
    const saved = localStorage.getItem("kopiflow-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitialDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggle = () => {
    const newDark = !isDark;
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    root.classList.toggle("dark", newDark);
    window.setTimeout(() => root.classList.remove("theme-transitioning"), 400);
    try {
      localStorage.setItem("kopiflow-theme", newDark ? "dark" : "light");
    } catch {}
    setIsDark(newDark);
  };

  return { isDark, toggle };
}
