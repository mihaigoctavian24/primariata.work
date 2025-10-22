export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

<system-reminder>
Background Bash 3f4f42 (command: pnpm test:e2e:chromium) (status: running) Has new output available. You can check its output using the BashOutput tool.
</system-reminder>