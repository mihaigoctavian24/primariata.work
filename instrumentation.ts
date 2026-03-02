import { logger } from "@/lib/logger";

export async function register(): Promise<void> {
  // @logtail/next handles its own initialization via withBetterStack
}

export function onRequestError(
  err: Error & { digest?: string },
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string | string[] | undefined };
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
    renderSource:
      | "react-server-components"
      | "react-server-components-payload"
      | "server-rendering";
    revalidateReason: "on-demand" | "stale" | undefined;
    renderType: "dynamic" | "dynamic-resume";
  }
): void {
  logger.error(`Request error: ${err.message}`, {
    digest: err.digest,
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
    revalidateReason: context.revalidateReason,
    renderType: context.renderType,
    stack: err.stack,
  });
}
