import { createFileRoute, redirect } from "@tanstack/react-router";
import { LandingPage } from "@/components/opencraft/LandingPage";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("opencraft_visited") === "true"
    ) {
      throw redirect({ to: "/app", replace: true });
    }
  },
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "OpenCraft — The Open Source Note Editor" },
      {
        name: "description",
        content:
          "OpenCraft is a beautiful, open-source, local-first markdown writing app. Write without the noise.",
      },
    ],
  }),
});
