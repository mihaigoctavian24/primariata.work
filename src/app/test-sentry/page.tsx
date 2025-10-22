"use client";

import { useEffect } from "react";

export default function TestSentryPage() {
  useEffect(() => {
    // Auto-trigger error on page load for Sentry verification
    console.log("Triggering test error for Sentry...");
  }, []);

  const triggerError = () => {
    throw new Error("🧪 TEST: Sentry Integration - Issue #43 Verification");
  };

  const triggerAsyncError = async () => {
    throw new Error("🧪 TEST: Async Sentry Error - Issue #43");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Sentry Error Testing</h1>

      <div className="flex max-w-md flex-col gap-4">
        <button
          onClick={triggerError}
          className="rounded-lg bg-red-500 px-6 py-3 font-medium text-white hover:bg-red-600"
        >
          🔥 Trigger Sync Error
        </button>

        <button
          onClick={triggerAsyncError}
          className="rounded-lg bg-orange-500 px-6 py-3 font-medium text-white hover:bg-orange-600"
        >
          ⚡ Trigger Async Error
        </button>

        <button
          onClick={() => {
            // Trigger error in event handler
            setTimeout(() => {
              throw new Error("🧪 TEST: Timeout Error - Issue #43");
            }, 100);
          }}
          className="rounded-lg bg-yellow-600 px-6 py-3 font-medium text-white hover:bg-yellow-700"
        >
          ⏱️ Trigger Timeout Error
        </button>
      </div>

      <div className="max-w-md text-center text-sm text-gray-600">
        <p>Click any button to trigger a test error.</p>
        <p>Error should appear in Sentry dashboard within 30 seconds.</p>
        <p className="mt-2 font-medium">
          Dashboard: https://sentry.io/organizations/primariata/issues/
        </p>
      </div>
    </div>
  );
}
