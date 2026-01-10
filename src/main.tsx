import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { initializeFirebase } from "./lib/firebase";

// Initialize Firebase after React is ready
initializeFirebase();

// Evita spam no console causado por scripts de extensões (ex.: SES/lockdown) durante o desenvolvimento.
if (import.meta.env.DEV) {
  const patterns = [/SES_UNCAUGHT_EXCEPTION/i, /lockdown-install\.js/i];

  const wrap = <T extends (...args: any[]) => any>(fn: T) =>
    ((...args: Parameters<T>) => {
      const text = args
        .filter((a) => typeof a === "string")
        .join(" ");

      if (patterns.some((p) => p.test(text))) return;
      return fn(...args);
    }) as T;

  console.error = wrap(console.error);
  console.warn = wrap(console.warn);
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <App />
  </ThemeProvider>
);
