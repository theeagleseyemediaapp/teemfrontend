import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, ArrowUp, ShieldCheck, Newspaper } from "lucide-react";
import { brandLogoUrl } from "@/lib/branding";

const parliamentaryLinks = [
  { to: "/parliament", label: "Parliament Hub" },
  { to: "/national-assembly", label: "National Assembly" },
  { to: "/senate", label: "Senate" },
  { to: "/legislature", label: "Current Legislature" },
  { to: "/plenaries", label: "Plenary Debates" },
  { to: "/committee-echoes", label: "Committee Echoes" },
  { to: "/bills-laws", label: "Bills & Laws" },
] as const;

const editorialLinks = [
  { to: "/", label: "Breaking News" },
  { to: "/economy", label: "Economy & Finance" },
  { to: "/opinion", label: "Opinion & Analysis" },
  { to: "/video", label: "Video Gallery" },
  { to: "/interviews", label: "Interviews Desk" },
  { to: "/parliamentary-diplomacy", label: "Diplomacy & Missions" },
  { to: "/constituency-actions", label: "Constituency Actions" },
] as const;

const companyLinks = [
  { to: "/about", label: "About The Eagle's Eye" },
  { to: "/pub", label: "Strategic Partnerships" },
  { to: "/premium", label: "Digital Subscriptions" },
  { to: "/awards", label: "Annual Honors & Awards" },
  { to: "/system-status", label: "System & API Status" },
  { to: "/contact", label: "Contact Us" },
] as const;

const legalLinks = [
  { to: "/legal/terms-of-service", label: "Terms of Service" },
  { to: "/legal/privacy-policy", label: "Privacy Policy" },
  { to: "/legal/editorial-policy", label: "Editorial Policy" },
  { to: "/legal/copyright-notice", label: "Copyright Notice" },
  { to: "/legal/disclaimer", label: "Disclaimer" },
] as const;

const socialsList = [
  {
    name: "Facebook",
    label: "Facebook",
    handle: "@theeagleseyemedia1",
    url: "https://www.facebook.com/p/The-Eagles-Eye-MEDIA-100063910274137/",
    icon: (
      <svg className="size-4 sm:size-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
      </svg>
    ),
    color: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
  },
  {
    name: "X (Twitter)",
    label: "X / Twitter",
    handle: "@TheEaglesEM",
    url: "https://x.com/TheEaglesEM",
    icon: (
      <svg className="size-3.5 sm:size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "hover:bg-black hover:text-white hover:border-slate-700",
  },
  {
    name: "Instagram",
    label: "Instagram",
    handle: "@theeaglesmedia",
    url: "https://www.instagram.com/theeaglesmedia?igsh=MTJlem95YzBpN2ppNw==",
    icon: (
      <svg className="size-4 sm:size-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
      </svg>
    ),
    color: "hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:border-transparent",
  },
  {
    name: "YouTube",
    label: "YouTube",
    handle: "@theeagleseyemedia1",
    url: "https://www.youtube.com/@theeagleseyemedia1",
    icon: (
      <svg className="size-4 sm:size-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 12 5 12 5s6.255 0 7.812.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
      </svg>
    ),
    color: "hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]",
  },
  {
    name: "TikTok",
    label: "TikTok",
    handle: "@theeagleseyemedia1",
    url: "https://www.tiktok.com/@theeagleseyemedia1",
    icon: (
      <svg className="size-3.5 sm:size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    color: "hover:bg-slate-900 hover:text-[#00F2FE] hover:border-slate-700",
  },
  {
    name: "WhatsApp",
    label: "WhatsApp Channel",
    handle: "+237 679 112 602",
    url: "https://wa.me/237679112602",
    icon: (
      <svg className="size-4 sm:size-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.35 5L2 22l5.17-1.32C8.61 21.53 10.26 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.95 14.15c-.21.59-1.22 1.15-1.68 1.18-.46.03-.9.19-2.97-.64-2.52-1-4.14-3.57-4.26-3.73-.13-.17-1.02-1.36-1.02-2.6 0-1.23.64-1.84.87-2.09.23-.25.5-.31.67-.31.17 0 .34 0 .49.01.16.01.37-.06.58.44.21.5.72 1.76.78 1.89.06.13.1.28.02.44-.08.17-.12.28-.24.42-.12.15-.26.33-.37.44-.13.13-.26.27-.11.53.15.26.67 1.1 1.44 1.79.99.88 1.83 1.15 2.09 1.28.26.13.41.11.56-.06.16-.17.67-.78.85-1.05.18-.27.36-.22.61-.13.25.09 1.6.75 1.87.89.27.13.45.2.52.31.06.12.06.69-.15 1.28z" clipRule="evenodd" />
      </svg>
    ),
    color: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
  },
] as const;

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4 border-l-2 border-amber-400 pl-2.5 flex items-center gap-1.5">
      {children}
    </h4>
  );
}

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-navy text-white/90 mt-16 relative border-t border-amber-400/20 shadow-2xl">
      {/* Top Gold Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

      {/* ── 1. CNN-STYLE SOCIAL SUB-MENU SECTION (UNIFIED NAVY BACKGROUND & CENTER ALIGNED) ── */}
      <section className="border-b border-white/10 relative overflow-hidden py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center justify-center text-center space-y-4">
          
          {/* Centered Title & Label */}
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 sm:w-16 bg-amber-400/50" />
            <h3 className="font-serif font-black text-sm sm:text-base md:text-lg uppercase tracking-[0.25em] text-white flex items-center gap-2">
              <span className="text-amber-400">FOLLOW</span> THE EAGLE'S EYE
            </h3>
            <span className="h-px w-8 sm:w-16 bg-amber-400/50" />
          </div>

          <p className="text-xs sm:text-sm text-slate-200/90 max-w-lg leading-relaxed">
            Stay connected with Cameroon's official parliamentary news desk, live plenary broadcasts, and verified investigative reports.
          </p>

          {/* Centered Social Media Buttons Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
            {socialsList.map((item) => {
              const isExternal = item.url.startsWith("http");
              return (
                <a
                  key={item.name}
                  href={item.url}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  aria-label={item.label}
                  title={`${item.label} (${item.handle})`}
                  className={`group size-10 sm:size-11 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 active:scale-95 cursor-pointer ${item.color}`}
                >
                  <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                </a>
              );
            })}
          </div>

          {/* Centered Handles & Quick-Links Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-300 font-mono">
            <span className="text-white">@theeagleseyemedia1</span>
            <span className="text-white/30">•</span>
            <span className="text-white">@TheEaglesEM</span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <Link 
              to="/watch-live" 
              className="font-sans font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider text-[11px] inline-flex items-center gap-1.5"
            >
              <span className="size-2 rounded-full bg-red-500 animate-pulse" /> Live Broadcast
            </Link>
            <span className="text-white/30 hidden sm:inline">•</span>
            <Link 
              to="/premium" 
              className="font-sans font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider text-[11px] inline-flex items-center gap-1.5"
            >
              <Newspaper className="size-3" /> Triweekly Journal
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN FOOTER NAVIGATION GRID (UNIFIED SAME BACKGROUND) ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
        {/* Brand Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={brandLogoUrl}
              alt="The Eagle's Eye Media"
              className="size-13 rounded-full ring-2 ring-amber-400 shrink-0 shadow-lg p-0.5 bg-navy"
              width={52}
              height={52}
            />
            <div className="min-w-0">
              <div className="font-serif font-black text-lg sm:text-xl leading-tight text-white truncate">
                The Eagle's Eye Media
              </div>
              <div className="text-[0.68rem] tracking-[0.2em] text-amber-400 font-extrabold uppercase italic">
                Eye of the Parliament
              </div>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm leading-relaxed text-slate-200 max-w-sm">
            Cameroon's exclusive daily parliamentary news platform with triweekly journal editions, published by The Eagle's Eye Media. Independent. Rigorous. On the floor.
          </p>

          <div className="pt-2 text-xs text-slate-300 space-y-1.5 border-t border-white/10 max-w-sm">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="size-3.5" /> Certified Press Organization
            </div>
            <p className="text-[11px] text-slate-300">
              Accredited Parliamentary Bureau • Yaoundé, Republic of Cameroon.
            </p>
          </div>
        </div>

        {/* Parliamentary Sections */}
        <nav className="lg:col-span-2">
          <ColHeading>Parliament</ColHeading>
          <ul className="space-y-2 text-xs font-medium">
            {parliamentaryLinks.map((s) => (
              <li key={s.to}>
                <Link to={s.to} className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all text-slate-200">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Editorial & Coverage */}
        <nav className="lg:col-span-2">
          <ColHeading>News &amp; Media</ColHeading>
          <ul className="space-y-2 text-xs font-medium">
            {editorialLinks.map((e) => (
              <li key={e.to}>
                <Link to={e.to} className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all text-slate-200">
                  {e.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Company & Services */}
        <nav className="lg:col-span-2">
          <ColHeading>Company</ColHeading>
          <ul className="space-y-2 text-xs font-medium">
            {companyLinks.map((c) => (
              <li key={c.label}>
                <Link to={c.to} className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all text-slate-200">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bureau & Contact Desk */}
        <div className="lg:col-span-2">
          <ColHeading>Bureau Contact</ColHeading>
          <ul className="space-y-3 text-xs text-slate-200 font-medium">
            <li className="flex gap-2">
              <Mail className="size-4 mt-0.5 shrink-0 text-amber-400" />
              <Link to="/contact" className="hover:text-amber-400 break-all transition-colors">
                contact@theeagleseyemedia.com
              </Link>
            </li>
            <li className="flex gap-2">
              <Phone className="size-4 mt-0.5 shrink-0 text-amber-400" />
              <span className="leading-snug">
                +237 679 112 602<br />
                +237 682 336 736
              </span>
            </li>
            <li className="flex gap-2">
              <MapPin className="size-4 mt-0.5 shrink-0 text-amber-400" />
              <span className="leading-snug">
                Obobogo, Yaoundé,<br />Cameroon
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── 3. LEGAL POLICIES SUB-STRIP (UNIFIED SAME BACKGROUND) ── */}
      <div className="border-t border-white/10 py-4 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-300">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Legal Compliance:</span>
          {legalLinks.map((l) => (
            <Link 
              key={l.to} 
              to={l.to} 
              className="text-[11px] text-slate-200 hover:text-amber-400 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link to="/contact" className="text-[11px] text-slate-200 hover:text-amber-400 transition-colors">
            Corrections Desk
          </Link>
        </div>
      </div>

      {/* ── 4. COPYRIGHT & BACK TO TOP BAR (UNIFIED SAME BACKGROUND) ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 text-xs text-amber-400 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-400 font-medium">
            <span>© {new Date().getFullYear()} The Eagle's Eye Media. All Rights Reserved.</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm group active:scale-95 cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="size-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
