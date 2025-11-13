import { createContext, useContext, useEffect } from "react";

type Theme = "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme: Theme = "light";
  const actualTheme: "light" = "light";

  useEffect(() => {
    const root = document.documentElement;
    // Always remove dark class to force light theme
    root.classList.remove("dark");
    localStorage.setItem("berry-events-theme", "light");
  }, []);

  const setTheme = (newTheme: Theme) => {
    // No-op: theme is always light
    console.log("Theme is locked to light mode");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
