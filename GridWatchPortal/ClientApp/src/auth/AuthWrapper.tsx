import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import React, { useEffect, useState } from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { instance, inProgress } = useMsal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (inProgress === InteractionStatus.None) {
      const account = instance.getActiveAccount();
      const accounts = instance.getAllAccounts();

      console.log("🔍 AuthWrapper state:", { inProgress, account, accounts });

      if (!account && accounts.length > 0) {
        instance.setActiveAccount(accounts[0]);
        setLoading(false);
      } else if (!account) {
        console.log("🔁 Triggering loginRedirect...");
        instance.loginRedirect(); // MSAL prevents duplicate redirects internally
      } else {
        setLoading(false);
      }
    }
  }, [instance, inProgress]);

  if (loading) {
    return (
      <div className="p-4 text-white bg-black h-screen flex items-center justify-center">
        🔐 Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
};
