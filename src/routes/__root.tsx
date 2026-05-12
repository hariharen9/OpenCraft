import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";

function ErrorDetail({ error }: { error: Error }) {
  const [copied, setCopied] = useState(false);

  const errorText = [
    `**Error:** ${error.name}: ${error.message}`,
    error.stack ? `**Stack:**\n\`\`\`\n${error.stack}\n\`\`\`` : "",
    "",
    `**URL:** ${window.location.href}`,
    `**User Agent:** ${navigator.userAgent}`,
    `**Timestamp:** ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");

  const githubIssueUrl = `https://github.com/hariharen9/OpenCraft/issues/new?title=${encodeURIComponent(error.name + ": " + error.message.slice(0, 80))}&body=${encodeURIComponent(errorText)}`;

  const copyError = async () => {
    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="mt-4 w-full max-w-lg">
      <details className="group">
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
          Error details
        </summary>
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-black/10 p-3 text-left text-[11px] text-muted-foreground whitespace-pre-wrap break-all">
          {errorText}
        </pre>
      </details>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          onClick={copyError}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          {copied ? "Copied!" : "Copy error"}
        </button>
        <a
          href={githubIssueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Report on GitHub
        </a>
      </div>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <ErrorDetail error={error} />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const unsub = useAuthStore.getState().init();
    return () => unsub();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="bottom-center" theme="dark" />
    </QueryClientProvider>
  );
}
