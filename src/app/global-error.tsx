"use client";

import { logger } from "@/lib/logger";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    logger.error(`GlobalError caught: ${error.message}`, {
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="ro">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
