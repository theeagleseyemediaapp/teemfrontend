import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2, MessageSquare, Send } from "lucide-react";
import { useSubmitSupportMessage } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — The Eagle's Eye Media" },
      { name: "description", content: "Get in touch with the newsroom for tips, press releases, corrections, or inquiries." },
      { property: "og:title", content: "Contact Us — The Eagle's Eye Media" },
      { property: "og:description", content: "Get in touch with the newsroom for tips, press releases, corrections, or inquiries." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
      { property: "og:image", content: "/logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact Us — The Eagle's Eye Media" },
      { name: "twitter:description", content: "Get in touch with the newsroom for tips, press releases, corrections, or inquiries." },
      { name: "twitter:image", content: "/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitMsg = useSubmitSupportMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    submitMsg.mutate(
      { name, email, subject, message },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success("Your message has been sent successfully!");
        },
        onError: (err: any) => {
          toast.error(err.message ?? "Failed to send message. Please check your connection.");
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="font-serif font-black text-4xl sm:text-5xl text-navy tracking-tight mb-4">
          Contact The Newsroom
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          Have a news tip, correction, or general inquiry? Fill out the form below to connect directly with our editors and support desk.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] items-start">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex gap-4">
            <div className="size-10 bg-gold/10 text-gold rounded-full flex items-center justify-center shrink-0">
              <Mail className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-base">Email Us</h3>
              <p className="text-sm text-slate-500 mt-1">For general inquiries and press releases:</p>
              <a href="mailto:contact@theeagleseyemedia.com" className="text-sm font-semibold text-gold hover:underline block mt-1.5 break-all">
                contact@theeagleseyemedia.com
              </a>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex gap-4">
            <div className="size-10 bg-gold/10 text-gold rounded-full flex items-center justify-center shrink-0">
              <Phone className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-base">Call Support</h3>
              <p className="text-sm text-slate-500 mt-1">Available Monday to Friday, 9am - 5pm:</p>
              <a href="tel:+237679112602" className="text-sm font-semibold text-gold hover:underline block mt-1.5">
                +237 679 112 602
              </a>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex gap-4">
            <div className="size-10 bg-gold/10 text-gold rounded-full flex items-center justify-center shrink-0">
              <MapPin className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-base">Newsroom Office</h3>
              <p className="text-sm text-slate-500 mt-1">Yaoundé, Cameroon</p>
              <span className="text-xs text-slate-400 block mt-1">Political Headquarters & Press Bureau</span>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-md">
          {submitted ? (
            <div className="text-center py-12">
              <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-10" />
              </div>
              <h2 className="font-serif font-bold text-2xl text-navy">Message Received</h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                Thank you for reaching out! We have successfully received your request and our editors will get back to you shortly.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm text-navy font-semibold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-2xl text-navy">Send A Message</h2>
                <p className="text-xs text-slate-400 mt-1">We read all tips and correspondence submitted to our desk.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Banmi ban"
                    className="w-full mt-1.5 rounded border border-border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-navy"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full mt-1.5 rounded border border-border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-navy"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Subject</span>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E.g. Story tip / News correction"
                  className="w-full mt-1.5 rounded border border-border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-navy"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Message Body</span>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Outline your message details, report correction, or news tip..."
                  className="w-full mt-1.5 rounded border border-border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-navy resize-none"
                />
              </label>

              <button
                type="submit"
                disabled={submitMsg.isPending}
                className="w-full bg-gold hover:bg-gold/90 text-navy font-bold uppercase tracking-wider text-xs py-3.5 rounded shadow transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitMsg.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="size-3.5" /> Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
