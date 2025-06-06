import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { MsalProvider } from "@azure/msal-react";
import { initializeMsal } from "@/services/authService";
import { AuthWrapper } from "@/auth/AuthWrapper";
import { TestApiConnection } from "@/components/TestApiConnection";

const startApp = async () => {
  const msalInstance = await initializeMsal();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <AuthWrapper>
          <>
            <TestApiConnection /> {/* 🔍 TEMPORARY test */}
            <App />
          </>
        </AuthWrapper>
      </MsalProvider>
    </StrictMode>
  );
};

startApp();
