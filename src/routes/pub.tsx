import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2, Award, Handshake, Newspaper, Calendar, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pub")({
  head: () => ({
    meta: [
      { title: "Strategic Partnerships & Media Kit — The Eagle's Eye Media" },
      { name: "description", content: "Collaborate with Cameroon's leading independent parliamentary press. Engage lawmakers, ministers, diplomatic missions, and civic leaders through strategic institutional partnerships, sponsored research briefs, and event alliances." },
      { name: "keywords", content: "strategic partnerships Cameroon, media collaboration Cameroon, parliamentary partnerships Yaoundé, institutional sponsorship Cameroon, The Eagle's Eye Media kit, corporate alliances Cameroon" },
      { property: "og:title", content: "Strategic Partnerships & Media Kit — The Eagle's Eye Media" },
      { property: "og:description", content: "High-impact institutional partnerships, corporate collaborations, and editorial alliances reaching key decision-makers across Cameroon." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/pub" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Media Strategic Partnerships" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Strategic Partnerships — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Engage decision-makers, MPs, and leaders in Cameroon's political and economic sectors." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/pub" }],
  }),
  component: PartnershipPage,
});

type InquiryType = "partnership" | "sponsored" | "event" | "institutional";

function PartnershipPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState<InquiryType>("partnership");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL ?? "/api/v1";
      const res = await fetch(`${apiBase}/public/partnership`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          company,
          phone,
          inquiryType,
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to submit inquiry");
      }

      setSubmitted(true);
      toast.success("Your partnership inquiry has been received! Check your inbox for confirmation.");
    } catch (err: any) {
      toast.error(err.message ?? "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-navy font-bold text-xs uppercase tracking-wider mb-4">
          <ShieldCheck className="size-3.5 text-gold" /> Institutional &amp; Corporate Alliances
        </div>
        <h1 className="font-serif font-black text-4xl sm:text-5xl text-navy tracking-tight mb-4">
          Partner with Cameroon's Parliamentary Press
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Position your institution in front of Members of Parliament, senators, state officials, corporate leaders, and key stakeholders across Cameroon and the CEMAC region.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-start">
        {/* Info & Packages */}
        <div className="space-y-8">
          <section className="bg-navy text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full translate-x-12 -translate-y-12" />
            <h2 className="font-serif font-bold text-2xl text-white mb-4">Why Partner With Us?</h2>
            <div className="space-y-5">
              <div className="flex gap-4">
                <CheckCircle2 className="size-6 text-gold shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base">Elite Decision-Maker Readership</h3>
                  <p className="text-sm text-white/80 mt-1">Read regularly by Cameroon's national representatives, senators, diplomatic missions, and executive advisors.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="size-6 text-gold shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base">Unparalleled Editorial Authority</h3>
                  <p className="text-sm text-white/80 mt-1">As Cameroon's premier independent parliamentary press, our publications command deep institutional trust.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="size-6 text-gold shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base">Targeted National &amp; Regional Impact</h3>
                  <p className="text-sm text-white/80 mt-1">Engage influential audiences focused on governance, legislation, economic policy, and bilateral diplomacy.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Partnership Types Panel */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-border rounded-xl p-5 bg-card shadow-sm">
              <Handshake className="size-8 text-gold mb-3" />
              <h3 className="font-serif font-bold text-navy text-lg">Strategic Partnerships</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Co-branded policy forums, institutional research features, and long-term corporate collaborations.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-card shadow-sm">
              <Award className="size-8 text-gold mb-3" />
              <h3 className="font-serif font-bold text-navy text-lg">Brand Visibility</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Prominent showcase placements across our highly trafficked portal, e-journals, and live broadcasts.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-card shadow-sm">
              <Newspaper className="size-8 text-gold mb-3" />
              <h3 className="font-serif font-bold text-navy text-lg">Sponsored Content</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                In-depth institutional spotlights, sector analysis, and specialized policy briefs.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-card shadow-sm">
              <Calendar className="size-8 text-gold mb-3" />
              <h3 className="font-serif font-bold text-navy text-lg">Event Alliances</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Live stream production, media partnership coverage, and official summit reporting.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-md">
          {submitted ? (
            <div className="text-center py-12">
              <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-10" />
              </div>
              <h2 className="font-serif font-bold text-2xl text-navy">Inquiry Sent</h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                Thank you for your interest! A partnership coordinator will contact you at <span className="font-bold text-navy">{email}</span> within 24 hours.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm text-navy font-semibold hover:underline"
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-2xl text-navy">Initiate a Partnership</h2>
                <p className="text-xs text-muted-foreground mt-1">Submit your organizational objectives and our team will prepare a tailored partnership proposal.</p>
              </div>

              {/* Custom Toggle Grid */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2.5">Partnership Type</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["partnership", "institutional", "sponsored", "event"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInquiryType(type)}
                      className={`py-2 px-3 text-xs font-semibold rounded border transition-all uppercase tracking-wider text-center ${
                        inquiryType === type
                          ? "bg-navy border-navy text-white shadow-sm font-bold"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {type === "sponsored" ? "Sponsored" : type === "event" ? "Event" : type === "institutional" ? "Institutional" : "Partner"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Dr. John Doe"
                    className="w-full mt-1.5 rounded border border-border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-navy"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Company / Organization</span>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Institution or corporate name"
                    className="w-full mt-1.5 rounded border border-border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-navy"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@organization.com"
                    className="w-full mt-1.5 rounded border border-border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-navy"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Phone Number</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+237 ..."
                    className="w-full mt-1.5 rounded border border-border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-navy"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Partnership Scope &amp; Objectives</span>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Outline your timeline, institutional objectives, or collaboration goals..."
                  className="w-full mt-1.5 rounded border border-border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-navy resize-none"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold hover:bg-gold/90 text-navy font-bold uppercase tracking-wider text-xs py-3.5 rounded shadow transition disabled:opacity-60"
              >
                {loading ? "Sending..." : "Submit Partnership Inquiry"}
              </button>

              <div className="border-t border-border pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Mail className="size-3.5 text-gold" /> partnership@theeagleseyemedia.com</span>
                <span className="flex items-center gap-1.5"><Phone className="size-3.5 text-gold" /> +237 679 112 602</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
