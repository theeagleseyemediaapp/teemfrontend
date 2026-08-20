import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/site/LegalDoc";
import { policies } from "@/legal/policies";

export const Route = createFileRoute("/legal/copyright-notice")({
  head: () => ({
    meta: [{ title: "Copyright Notice — The Eagle's Eye Media" }],
    links: [{ rel: "canonical", href: "/legal/copyright-notice" }],
  }),
  component: () => <LegalDoc policy={policies.copyrightNotice} />,
});
