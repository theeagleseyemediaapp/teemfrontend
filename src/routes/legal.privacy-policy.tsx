import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/site/LegalDoc";
import { policies } from "@/legal/policies";

export const Route = createFileRoute("/legal/privacy-policy")({
  head: () => ({
    meta: [{ title: "Privacy Policy — The Eagle's Eye Media" }],
    links: [{ rel: "canonical", href: "/legal/privacy-policy" }],
  }),
  component: () => <LegalDoc policy={policies.privacyPolicy} />,
});
