import { useState, useEffect } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kopiflow-theme");
    const shouldBeDark = saved ? saved === "dark" : false;
    document.documentElement.classList.toggle("dark", shouldBeDark);
    setIsDark(shouldBeDark);
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("kopiflow-theme", newDark ? "dark" : "light");
    setIsDark(newDark);
  };

  return { isDark, toggle };
}
