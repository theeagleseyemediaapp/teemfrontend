import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/")({
  head: () => ({
    meta: [
      { title: "Legal, Privacy Policy & Editorial Ethics — The Eagle's Eye Media" },
      { name: "description", content: "Review the official Terms of Service, Privacy Policy, Editorial Code of Ethics, and Copyright Notice governing The Eagle's Eye Media." },
      { name: "keywords", content: "The Eagle's Eye legal, privacy policy Cameroon press, terms of service, editorial ethics Cameroon, journalist code of conduct" },
      { property: "og:title", content: "Legal & Editorial Policies — The Eagle's Eye Media" },
      { property: "og:description", content: "Official Terms of Service, Privacy Policy, Editorial Code, and Copyright notices." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/legal" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Legal & Editorial Ethics" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Legal & Editorial Policies — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Policies, privacy standards, and editorial ethics." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/legal" }],
  }),
  component: LegalIndex,
});

const POLICIES = [
  { to: "/legal/terms-of-service", label: "Terms of Service", desc: "Rules governing use of the platform and user obligations." },
  { to: "/legal/privacy-policy", label: "Privacy Policy", desc: "How we collect, store, and protect your personal data." },
  { to: "/legal/editorial-policy", label: "Editorial Policy", desc: "Journalistic standards, corrections, and AI usage rules." },
  { to: "/legal/copyright-notice", label: "Copyright Notice", desc: "Intellectual property rights and reuse permissions." },
  { to: "/legal/disclaimer", label: "Disclaimer", desc: "Limitations of liability and content warnings." },
];

function LegalIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif font-black text-3xl text-navy mb-2">Legal</h1>
      <p className="text-sm text-muted-foreground mb-8">Policies and terms that govern The Eagle's Eye Media and its users.</p>
      <div className="space-y-4">
        {POLICIES.map((p) => (
          <Link key={p.to} to={p.to} className="block rounded border border-border bg-card p-5 hover:border-gold hover:shadow-md transition-all">
            <div className="font-serif font-bold text-navy">{p.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Link to="/" className="text-sm text-navy font-semibold hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
