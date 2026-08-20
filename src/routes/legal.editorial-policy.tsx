import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/site/LegalDoc";
import { policies } from "@/legal/policies";

export const Route = createFileRoute("/legal/editorial-policy")({
  head: () => ({
    meta: [{ title: "Editorial Policy — The Eagle's Eye Media" }],
    links: [{ rel: "canonical", href: "/legal/editorial-policy" }],
  }),
  component: () => <LegalDoc policy={policies.editorialPolicy} />,
});
