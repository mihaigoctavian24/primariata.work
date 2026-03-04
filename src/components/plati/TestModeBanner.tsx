"use client";

/**
 * TestModeBanner -- displays a warning when payments are in mock/demo mode.
 *
 * Reads NEXT_PUBLIC_GHISEUL_MODE env variable to determine mode.
 * Renders amber warning banner when mode is 'mock', returns null otherwise.
 */
export function TestModeBanner(): React.ReactElement | null {
  const mode = process.env.NEXT_PUBLIC_GHISEUL_MODE;

  if (mode !== "mock") {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-center dark:border-amber-700 dark:bg-amber-950/50">
      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
        Mod demonstrativ &mdash; plătile nu sunt reale
      </p>
    </div>
  );
}
