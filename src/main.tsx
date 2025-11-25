import { createRoot } from "react-dom/client";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <LocalizationProvider>
    <App />
  </LocalizationProvider>
);
