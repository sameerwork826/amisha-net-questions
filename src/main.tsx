import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import ProgressSync from "./components/ProgressSync.tsx";
import { CLERK_KEY, clerkEnabled } from "./lib/authConfig.ts";
import "./index.css";

const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {clerkEnabled ? (
      <ClerkProvider publishableKey={CLERK_KEY!} afterSignOutUrl="/">
        <ProgressSync />
        {app}
      </ClerkProvider>
    ) : (
      app
    )}
  </StrictMode>
);
