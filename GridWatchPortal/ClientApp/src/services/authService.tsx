import { PublicClientApplication, Configuration } from "@azure/msal-browser";

export let msalInstance: PublicClientApplication;
export let scopes: string[] = [];

export const initializeMsal = async () => {
  const res = await fetch("/config.json");
  const config = await res.json();

  // Store scopes for external use
  scopes = config.azureAd.scopes || [];

  const msalConfig: Configuration = {
    auth: {
      clientId: config.azureAd.clientId,
      authority: config.azureAd.authority,
      redirectUri: config.azureAd.redirectUri,
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: true,
    },
  };

  msalInstance = new PublicClientApplication(msalConfig);

  await msalInstance.initialize();

  try {
    const response = await msalInstance.handleRedirectPromise();

    if (response) {
      console.log("✅ [MSAL] Redirect login success:", response);
      msalInstance.setActiveAccount(response.account);
    } else {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
        console.log("✅ [MSAL] Loaded from cache:", accounts[0]);
      } else {
        console.log("ℹ️ [MSAL] No accounts found — user not logged in");
      }
    }
  } catch (error) {
    console.error("❌ [MSAL] handleRedirectPromise failed:", error);
  }

  return msalInstance;
};

// 🔁 Export scope for use in fetchers
export const getScopes = () => scopes;
export const getMsalInstance = () => msalInstance;
