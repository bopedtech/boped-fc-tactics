import { createRoot } from "react-dom/client";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
import { UserTierProvider } from "@/contexts/UserTierContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <LocalizationProvider>
    <UserTierProvider>
      <App />
    </UserTierProvider>
  </LocalizationProvider>
);
