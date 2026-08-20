import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/site/LegalDoc";
import { policies } from "@/legal/policies";

export const Route = createFileRoute("/legal/terms-of-service")({
  head: () => ({
    meta: [{ title: "Terms of Service — The Eagle's Eye Media" }],
    links: [{ rel: "canonical", href: "/legal/terms-of-service" }],
  }),
  component: () => <LegalDoc policy={policies.termsOfService} />,
});
