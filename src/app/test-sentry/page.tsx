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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-3xl font-bold">Sentry Error Testing</h1>

      <div className="flex flex-col gap-4 max-w-md">
        <button
          onClick={triggerError}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          🔥 Trigger Sync Error
        </button>

        <button
          onClick={triggerAsyncError}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium"
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
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          ⏱️ Trigger Timeout Error
        </button>
      </div>

      <div className="text-sm text-gray-600 text-center max-w-md">
        <p>Click any button to trigger a test error.</p>
        <p>Error should appear in Sentry dashboard within 30 seconds.</p>
        <p className="mt-2 font-medium">Dashboard: https://sentry.io/organizations/primariata/issues/</p>
      </div>
    </div>
  );
}
