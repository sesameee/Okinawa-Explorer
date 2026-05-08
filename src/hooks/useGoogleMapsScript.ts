import { useEffect, useState } from "react";

type MapsLoadState = "idle" | "loading" | "ready" | "error" | "missing_key";

declare global {
  interface Window {
    google?: unknown;
    __tripMapsLoaded?: boolean;
    __tripMapsPromise?: Promise<void>;
    initTripMaps?: () => void;
  }
}

export function useGoogleMapsScript(apiKey?: string): MapsLoadState {
  const [state, setState] = useState<MapsLoadState>("idle");

  useEffect(() => {
    if (!apiKey) {
      setState("missing_key");
      return;
    }

    if ((window as any).google?.maps) {
      setState("ready");
      return;
    }

    setState("loading");

    if (!window.__tripMapsPromise) {
      window.__tripMapsPromise = new Promise<void>((resolve, reject) => {
        window.initTripMaps = () => {
          window.__tripMapsLoaded = true;
          resolve();
        };

        const existed = document.querySelector(
          'script[data-gmaps-api="trip"]',
        ) as HTMLScriptElement | null;
        if (existed) return;

        const s = document.createElement("script");
        s.dataset.gmapsApi = "trip";
        s.async = true;
        s.defer = true;
        s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
          apiKey,
        )}&libraries=places,geometry&v=weekly&callback=initTripMaps&loading=async`;
        s.onerror = () => reject(new Error("Google Maps script load failed"));
        document.head.appendChild(s);
      });
    }

    window.__tripMapsPromise
      .then(() => setState("ready"))
      .catch(() => setState("error"));
  }, [apiKey]);

  return state;
}
