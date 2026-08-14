import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lp")({
  head: () => ({
    meta: [
      { title: "Task Partners | Espace de revue partenaire" },
      {
        name: "description",
        content:
          "Task Partners est un espace moderne pour les activités de revue partenaire, les ressources numériques, le suivi d’activité, la gestion de compte et le support.",
      },
    ],
  }),
  component: LpRoute,
});

function LpRoute() {
  return (
    <iframe
      src="/lp-page/index.html"
      title="Task Partners"
      style={{ width: "100%", minHeight: "100dvh", border: 0, display: "block", background: "#F8FAFC" }}
    />
  );
}
