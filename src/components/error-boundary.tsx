"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">A apărut o eroare</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Ne cerem scuze pentru inconvenient. Echipa noastră a fost notificată automat.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-400 dark:text-gray-500">Cod eroare: {error.digest}</p>
        )}
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Încearcă din nou
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
          >
            Înapoi acasă
          </button>
        </div>
      </div>
    </div>
  );
}
