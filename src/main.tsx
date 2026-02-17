import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import App from "./App.tsx";
import "./index.css";

// Initialize app
const initApp = async () => {
  // Wait for Capacitor to be ready on native platforms
  if (Capacitor.isNativePlatform()) {
    console.log("Running on native platform:", Capacitor.getPlatform());
  }

  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
};

// Start the app
initApp();
