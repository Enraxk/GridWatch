import { useEffect, useState } from "react";

export type GridWatchConfig = {
  azureAd: {
    clientId: string;
    tenantId: string;
    authority: string;
    redirectUri: string;
    scopes: string[];
  };
  apiUrls: {
    deviceApi: string;
    adtApi: string;
    adxApi: string;
    sqlApi: string;
  };
  blobStorageUrl?: string;
  azureMapsKey: string;
};

export const useConfig = () => {
  const [config, setConfig] = useState<GridWatchConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch config.json:", err);
        setLoading(false);
      });
  }, []);

  return { config, loading };
};
