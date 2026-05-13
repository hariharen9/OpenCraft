import { QueryClient } from "@tanstack/react-query";
import { createRouter, createHashHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();
const hashHistory = createHashHistory();

const router = createRouter({
  routeTree,
  context: { queryClient },
  history: typeof window !== "undefined" && navigator.userAgent.toLowerCase().includes("electron") ? hashHistory : undefined,
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function getRouter() {
  return router;
}
