import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Récompenses TikTok" },
      { name: "description", content: "Réclamez votre récompense TikTok et recevez votre paiement instantanément via Cash App, PayPal, Venmo, Zelle ou votre banque." },
      { property: "og:title", content: "Récompenses TikTok" },
      { property: "og:description", content: "Réclamez votre récompense TikTok et recevez votre paiement instantanément via Cash App, PayPal, Venmo, Zelle ou votre banque." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("__route") === "tasks-app") {
      params.delete("__route");
      const search = Object.fromEntries(params.entries());
      void navigate({ to: "/tasks-app", replace: true, search });
      return;
    }

  }, [navigate]);

  return null;
}
