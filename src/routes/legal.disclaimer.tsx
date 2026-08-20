import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/site/LegalDoc";
import { policies } from "@/legal/policies";

export const Route = createFileRoute("/legal/disclaimer")({
  head: () => ({
    meta: [{ title: "Disclaimer — The Eagle's Eye Media" }],
    links: [{ rel: "canonical", href: "/legal/disclaimer" }],
  }),
  component: () => <LegalDoc policy={policies.disclaimer} />,
});
