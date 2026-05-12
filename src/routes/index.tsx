import { createFileRoute, redirect } from "@tanstack/react-router";
import { LandingPage } from "@/components/opencraft/LandingPage";
import { useEffect } from "react";

function IndexPage() {
  useEffect(() => {
    document.title = "OpenCraft — The Open Source Note Editor";
  }, []);

  return <LandingPage />;
}

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && localStorage.getItem("opencraft_visited") === "true") {
      throw redirect({ to: "/app", replace: true });
    }
  },
  component: IndexPage,
});
