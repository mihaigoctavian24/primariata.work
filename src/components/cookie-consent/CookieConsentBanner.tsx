"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "cookie-consent";

/**
 * Remove the cookie consent preference from localStorage and dispatch
 * a storage event so any mounted CookieConsentBanner re-renders the banner.
 */
export function reopenCookieConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  // Dispatch a custom storage event so the component reacts in the same tab
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

/**
 * GDPR-compliant cookie consent banner.
 *
 * - Shows on first visit (no localStorage value)
 * - Hides after user accepts or rejects
 * - Can be reopened via `reopenCookieConsent()`
 * - Initializes hidden to prevent hydration flash
 */
export function CookieConsentBanner(): React.ReactElement | null {
  const [showBanner, setShowBanner] = useState(false);

  const checkConsent = useCallback((): void => {
    const consent = localStorage.getItem(STORAGE_KEY);
    setShowBanner(consent === null);
  }, []);

  useEffect(() => {
    checkConsent();

    function handleStorage(e: StorageEvent): void {
      if (e.key === STORAGE_KEY || e.key === null) {
        checkConsent();
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [checkConsent]);

  function handleAccept(): void {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setShowBanner(false);
  }

  function handleReject(): void {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label="Consimtamant cookie-uri"
      className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <Cookie className="text-muted-foreground mt-0.5 size-5 flex-shrink-0" />
          <p className="text-muted-foreground text-sm leading-relaxed">
            Acest site foloseste cookie-uri esentiale pentru functionare si cookie-uri de
            performanta pentru imbunatatirea experientei. Citeste{" "}
            <Link href="/confidentialitate" className="text-primary font-medium hover:underline">
              Politica de Confidentialitate
            </Link>{" "}
            pentru detalii.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleReject}>
            Refuz
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
