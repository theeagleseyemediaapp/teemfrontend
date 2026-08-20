import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, X, Play, Crown, ChevronDown, Bell, Radio } from "lucide-react";
import { brandLogoUrl } from "@/lib/branding";
import { useSearchSuggestions, useSettings, useAlerts } from "@/lib/api";

import { useAuthState } from "../auth/useAuthState";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { AuthModal } from "@/components/auth/AuthModal";
import { HeaderWeatherPill } from "./HeaderWeatherPill";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

const NAV = [
  { to: "/", label: "Breaking News" },
  { to: "/legislature", label: "Current Legislature" },
  { to: "/plenaries", label: "Plenaries" },
  { to: "/committee-echoes", label: "Committee Echoes" },
  { to: "/networking", label: "Networking" },
  { to: "/parliamentary-diplomacy", label: "Diplomacy" },
  { to: "/constituency-actions", label: "Constituency" },
  { to: "/bills-laws", label: "Bills / Laws" },
  { to: "/opinion", label: "Opinion" },
  { to: "/weather", label: "Météo Weather" },
  { to: "/video", label: "Video" },
  { to: "/premium", label: "Magazine" },
  { to: "/about", label: "About" },
] as const;

const SUBNAV = [
  { label: "Latest", to: "/" },
  { label: "Magazines & E-Paper", to: "/premium" },
  { label: "Analysis", to: "/opinion" },
  { label: "Debates", to: "/plenaries" },
  { label: "Votes", to: "/bills-laws" },
  { label: "Parliament MPs", to: "/legislature" },
  { label: "National Assembly", to: "/national-assembly" },
  { label: "Senate", to: "/senate" },
  { label: "Committees", to: "/committee-echoes" },
  { label: "Météo Radar", to: "/weather" },
];

function useDebounced(value: string, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function BlinkingLiveButton({ isBlinking }: { isBlinking: boolean }) {
  const triggerLivePlayer = () => {
    window.dispatchEvent(new CustomEvent("open-live-player"));
  };

  return (
    <button
      onClick={triggerLivePlayer}
      className="inline-flex items-center gap-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 border border-red-500/30 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer shrink-0"
    >
      <span className="relative flex size-2">
        {isBlinking && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
        )}
        <span className="relative inline-flex rounded-full size-2 bg-white" />
      </span>
      Live Press
    </button>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut } = useAuthState();
  const debouncedQuery = useDebounced(searchQuery);
  const suggestions = useSearchSuggestions(debouncedQuery);
  const settings = useSettings();
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileDiplomacyOpen, setMobileDiplomacyOpen] = useState(false);
  const [mobileVideoOpen, setMobileVideoOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const aiEnabled = settings.data?.aiSearchEnabled !== false;

  const liveConfig = useQuery({
    queryKey: ["live-config"],
    queryFn: () => fetch(`${API_BASE}/live-config`).then((r) => (r.ok ? r.json() : null)),
    refetchInterval: 30_000,
  });

  const castrLiveEnabled = Boolean((settings.data as any)?.castrLiveEnabled ?? (settings.data as any)?.isLive ?? false);
  const activeVideoId = liveConfig.data?.videoId ?? "";
  const isLive = castrLiveEnabled || (activeVideoId && activeVideoId !== "offline" && activeVideoId.trim() !== "");
  const isBlinking = (settings.data as any)?.castrLiveBlinking ?? true;

  const notificationsQuery = useQuery({
    queryKey: ["public-notifications-header"],
    queryFn: () => fetch(`${API_BASE}/public/notifications`).then((r) => (r.ok ? r.json() : null)),
    refetchInterval: 15_000,
  });

  const publicNotifications = Array.isArray(notificationsQuery.data) ? notificationsQuery.data : [];
  const [readIds, setReadIds] = useState<string[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("eem_header_read_ids_v1");
        if (stored) setReadIds(JSON.parse(stored));
      } catch {}

      const handleOpenAlert = (e: CustomEvent) => {
        if (e.detail) setSelectedAlert(e.detail);
      };
      window.addEventListener("open-alert-modal", handleOpenAlert as EventListener);
      return () => window.removeEventListener("open-alert-modal", handleOpenAlert as EventListener);
    }
  }, []);

  const unreadCount = publicNotifications.filter((n: any) => n.id && !readIds.includes(n.id)).length;

  const handleBellClick = () => {
    if (publicNotifications.length > 0) {
      const allIds = Array.from(new Set([...readIds, ...publicNotifications.map((n: any) => n.id)]));
      setReadIds(allIds);
      try {
        localStorage.setItem("eem_header_read_ids_v1", JSON.stringify(allIds));
      } catch {}
    }
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  };

  const [language, setLanguage] = useState<"en" | "fr">("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("eem.preferred-lang.v1");
    if (stored === "fr" || stored === "en") {
      setLanguage(stored);
    }

    const handleLangChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "en" || detail === "fr") {
        setLanguage(detail);
      }
    };
    window.addEventListener("eem-language-changed", handleLangChange);
    return () => window.removeEventListener("eem-language-changed", handleLangChange);
  }, []);

  const changeLanguage = (lang: "en" | "fr") => {
    try {
      localStorage.setItem("eem.preferred-lang.v1", lang);
      setLanguage(lang);
      window.dispatchEvent(new CustomEvent("eem-language-changed", { detail: lang }));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-slate-800 text-white text-[11px] border-b border-white/5">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-1.5 gap-2">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline opacity-80 text-[11px]">Yaoundé, Cameroon</span>
            <HeaderWeatherPill />
          </div>
          <span className="sm:hidden text-[10px] font-black uppercase tracking-wider text-amber-400">T.E.E.Media</span>
          <div className="flex items-center gap-2.5 sm:gap-3 ml-auto sm:ml-0">
            {/* Language Switcher */}
            <div className="flex items-center border border-white/10 rounded overflow-hidden select-none mr-0.5 sm:mr-1 bg-white/5">
              <button 
                onClick={() => changeLanguage("en")}
                className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition-colors ${language === "en" ? "bg-amber-400 text-navy font-black" : "text-white/60 hover:text-white"}`}
              >
                EN
              </button>
              <button 
                onClick={() => changeLanguage("fr")}
                className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition-colors ${language === "fr" ? "bg-amber-400 text-navy font-black" : "text-white/60 hover:text-white"}`}
              >
                FR
              </button>
            </div>

            <Link to="/premium" className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-navy shadow-sm">
              <Crown className="size-2.5" /> Subscribe
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "admin" || user.role === "editor" || user.role === "super_admin" ? (
                  <Link to="/admin" className="inline-flex items-center gap-1.5 hover:text-gold group">
                    <div className="size-6 sm:size-7 rounded-full bg-amber-400 text-navy font-black text-[11px] flex items-center justify-center ring-2 ring-amber-400/50 shadow-sm shrink-0">
                      {user.displayName?.[0]?.toUpperCase() || "A"}
                    </div>
                    <span className="hidden sm:inline font-semibold text-xs text-white group-hover:text-gold">{user.displayName}</span>
                  </Link>
                ) : (
                  <Link to="/profile" className="inline-flex items-center gap-1.5 hover:text-gold group">
                    <div className="size-6 sm:size-7 rounded-full bg-amber-400 text-navy font-black text-[11px] flex items-center justify-center ring-2 ring-amber-400/50 shadow-sm shrink-0">
                      {user.displayName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:inline font-semibold text-xs text-white group-hover:text-gold">{user.displayName}</span>
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Link */}
                <Link to="/sign-in" className="inline-flex sm:hidden items-center gap-1 hover:text-gold p-0.5" aria-label="Sign In">
                  <div className="size-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/90">
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </Link>
                {/* Desktop Modal Trigger */}
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 hover:text-gold py-0.5 px-2 rounded-full hover:bg-white/5 transition-colors"
                >
                  <div className="size-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/90">
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <span className="text-xs font-semibold">Sign In</span>
                </button>
                <AuthModal 
                  isOpen={isAuthModalOpen} 
                  onClose={() => setIsAuthModalOpen(false)} 
                  onSuccess={() => setIsAuthModalOpen(false)}
                />
              </>
            )}
            
            {/* Notification Bell Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Notifications"
                  onClick={handleBellClick}
                  className="hover:text-gold relative p-1 outline-none select-none cursor-pointer"
                >
                  <Bell className="size-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-navy border border-white/10 text-white w-80 max-h-[420px] overflow-y-auto p-2 scrollbar-thin z-[70] shadow-2xl rounded-lg">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/10 select-none">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                    <Bell className="size-3.5 animate-bounce" /> Parliamentary News & Alerts
                  </span>
                  {publicNotifications.length > 0 && (
                    <span className="text-[10px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded">
                      {publicNotifications.length}
                    </span>
                  )}
                </div>
                {publicNotifications.length === 0 ? (
                  <div className="text-xs text-white/50 p-6 text-center select-none">
                    No active updates or broadcasts right now.
                  </div>
                ) : (
                  publicNotifications.map((n: any) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.type === "article" && n.slug) {
                          window.location.href = `/article/${n.slug}`;
                        } else {
                          setSelectedAlert(n);
                        }
                      }}
                      className="p-3 border-b border-white/5 last:border-0 hover:bg-white/10 rounded transition-colors cursor-pointer group flex flex-col gap-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-white group-hover:text-gold transition-colors line-clamp-2">
                          {n.title}
                        </span>
                        {n.type === "alert" && (
                          <span className="shrink-0 bg-red-600 text-[9px] uppercase font-bold text-white px-1.5 py-0.5 rounded animate-pulse">
                            Alert
                          </span>
                        )}
                      </div>
                      {n.alertBody && (
                        <div className="text-[11px] text-white/70 line-clamp-2 leading-relaxed">
                          {n.alertBody}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-white/40 mt-1">
                        <span>{n.time || new Date().toLocaleTimeString()}</span>
                        <span className="text-gold/80 group-hover:underline">
                          {n.type === "article" ? "Read report →" : "View communiqué →"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div ref={searchRef} className="relative">
              <button
                aria-label="Search"
                onClick={() => setSearchOpen((v) => !v)}
                className="hover:text-gold"
              >
                <Search className="size-4" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-[min(92vw,420px)] rounded-lg border border-border bg-card shadow-2xl overflow-hidden z-[70]">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
                    <Search className="size-4 text-muted-foreground shrink-0" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search articles…"
                      className="flex-1 bg-transparent text-sm text-foreground outline-none"
                    />
                    <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-muted-foreground hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {searchQuery.trim().length < 2 && (
                      <p className="px-4 py-3 text-xs text-muted-foreground">Type at least 2 characters</p>
                    )}
                    {searchQuery.trim().length >= 2 && suggestions.isLoading && (
                      <p className="px-4 py-3 text-xs text-muted-foreground">Searching…</p>
                    )}
                    {searchQuery.trim().length >= 2 && !suggestions.isLoading && suggestions.data?.length === 0 && (
                      <p className="px-4 py-3 text-xs text-muted-foreground">No matches</p>
                    )}
                    {suggestions.data?.map((item) => (
                      <Link
                        key={item.slug}
                        to="/article/$slug"
                        params={{ slug: item.slug }}
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                        className="block px-4 py-3 hover:bg-muted/60 border-b border-border/50 last:border-0"
                      >
                        <div className="font-serif font-bold text-sm text-navy leading-snug">{item.label}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.summary}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-navy text-white border-b border-navy/80 shadow-md">
        <div className="mx-auto max-w-7xl flex items-center gap-4 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={brandLogoUrl} alt="The Eagle's Eye Media" className="size-8 sm:size-9 rounded-full ring-2 ring-gold/80 shrink-0" width={36} height={36} />
            <div className="leading-tight">
              <span className="font-serif font-bold text-xs sm:text-sm tracking-tight text-white/90 hidden sm:block">The Eagle's Eye Media</span>
              <span className="font-serif font-black text-[11px] tracking-tight text-white/90 block sm:hidden">T.E.E.Media</span>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            {isLive && <BlinkingLiveButton isBlinking={isBlinking} />}

            <nav className="hidden md:flex items-stretch overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
              {NAV.map((n) => {
                if (n.to === "/parliamentary-diplomacy") {
                  return (
                    <DropdownMenu key={n.to}>
                      <DropdownMenuTrigger asChild>
                        <button className="px-3 py-2.5 text-xs font-bold text-white/90 hover:text-white flex items-center gap-1 transition-colors cursor-pointer outline-none select-none">
                          {n.label} <ChevronDown className="size-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-navy border border-white/10 text-white min-w-44 p-1">
                        <DropdownMenuItem asChild>
                          <Link
                            to="/parliamentary-diplomacy"
                            className="block w-full px-3 py-2 text-xs font-bold text-white/85 hover:text-white hover:bg-white/10 transition-colors rounded-sm cursor-pointer"
                          >
                            Parliamentary Diplomacy
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/parliamentary-missions"
                            className="block w-full px-3 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-white/85 hover:text-white hover:bg-white/10 transition-colors rounded-sm cursor-pointer"
                          >
                            Parliamentary Missions
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                if (n.to === "/video") {
                  return (
                    <DropdownMenu key={n.to}>
                      <DropdownMenuTrigger asChild>
                        <button className="px-2 py-2 text-[0.65rem] font-bold uppercase tracking-wider text-white/85 hover:text-white flex items-center gap-1 transition-colors cursor-pointer outline-none select-none">
                          {n.label} <ChevronDown className="size-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-navy border border-white/10 text-white min-w-40 p-1">
                        <DropdownMenuItem asChild>
                          <Link
                            to="/video"
                            className="block w-full px-3 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-white/85 hover:text-white hover:bg-white/10 transition-colors rounded-sm cursor-pointer"
                          >
                            Video Gallery
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/interviews"
                            className="block w-full px-3 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-white/85 hover:text-white hover:bg-white/10 transition-colors rounded-sm cursor-pointer"
                          >
                            Interviews
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                if (n.to === "/about") {
                  return (
                    <DropdownMenu key={n.to}>
                      <DropdownMenuTrigger asChild>
                        <button className="px-2 py-2 text-[0.65rem] font-bold uppercase tracking-wider text-white/85 hover:text-white flex items-center gap-1 transition-colors cursor-pointer outline-none select-none">
                          {n.label} <ChevronDown className="size-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-navy border border-white/10 text-white min-w-48 p-1">
                        <DropdownMenuItem asChild>
                          <Link
                            to="/about"
                            className="block w-full px-3 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-white/85 hover:text-white hover:bg-white/10 transition-colors rounded-sm cursor-pointer"
                          >
                            About Us
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/awards"
                            className="block w-full px-3 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-white/85 hover:text-white hover:bg-white/10 transition-colors rounded-sm cursor-pointer"
                          >
                            The Eagle's Eye Awards
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className="px-3 py-2.5 text-[11px] font-bold text-white/90 border-b-2 border-transparent hover:text-white hover:border-gold transition-colors"
                    activeOptions={{ exact: n.to === "/" }}
                    activeProps={{ className: "px-3 py-2.5 text-[11px] font-bold text-white border-b-2 border-gold" }}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            <button
              aria-label="Menu"
              className="lg:hidden p-2 rounded hover:bg-white/10"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>

        <div className="bg-white text-foreground shadow-sm">
          <div className="mx-auto max-w-7xl px-4">
            <div className="no-scrollbar flex gap-6 overflow-x-auto py-2.5 text-[11px] font-black uppercase tracking-wider text-navy whitespace-nowrap scroll-smooth">
              {SUBNAV.map((s) => {
                if (s.label === "Trending") {
                  return (
                    <DropdownMenu key={s.label}>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:text-amber-500 transition-colors flex items-center gap-1 select-none">
                          {s.label} <ChevronDown className="size-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white border border-border shadow-md min-w-40 z-50">
                        {["Budget 2025", "Senate Reform", "MPs Oversight", "Oil Revenue", "Education Bill", "Healthcare"].map(tag => (
                          <DropdownMenuItem key={tag} asChild>
                            <Link to="/" search={{ q: tag }} className="block px-3 py-2 text-xs font-bold text-navy hover:bg-slate-100 hover:text-amber-500 cursor-pointer">
                              #{tag}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }

                return (
                  <Link key={s.label} to={s.to} className="hover:text-amber-500 transition-colors">
                    {s.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-navy/98 text-white flex flex-col overflow-hidden">

          {/* ── TOP BAR ── */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0A1128]/95 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2.5">
              <img src={brandLogoUrl} alt="T.E.E.Media" className="size-8 rounded-full ring-2 ring-amber-400" />
              <div>
                <span className="font-serif font-black text-[11px] block leading-none tracking-tight text-white">THE EAGLE'S EYE</span>
                <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-amber-400">T.E.E.Media</span>
              </div>
            </div>
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* ── SCROLLABLE CONTENT ── */}
          <nav className="flex-1 overflow-y-auto bg-navy/95">
            <div className="px-4 pt-4 pb-6 space-y-5">

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search bills, MPs, debates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-colors"
                />
              </div>

              {/* Live CTA — driven by admin settings */}
              {isLive && (
              <button
                onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("open-live-player")); }}
                className="w-full flex items-center justify-between bg-red-700/25 border border-red-500/35 rounded-xl px-4 py-3 hover:bg-red-700/35 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2">
                    {isBlinking && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    )}
                    <span className="relative inline-flex rounded-full size-2 bg-red-500" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-white">Live Press Stream</span>
                </div>
                <span className="text-[9px] font-black tracking-widest text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full">ON AIR</span>
              </button>
              )}

              {/* ── CHAMBER & LEGISLATION ── */}
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-1 h-4 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-400">Chamber &amp; Legislation</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { to: "/", icon: "newspaper", label: "Breaking News", badge: "LIVE" },
                    { to: "/legislature", icon: "how_to_vote", label: "Current Legislature", badge: "NEW" },
                    { to: "/national-assembly", icon: "account_balance", label: "National Assembly" },
                    { to: "/senate", icon: "account_balance", label: "Senate" },
                    { to: "/plenaries", icon: "gavel", label: "Plenaries" },
                    { to: "/committee-echoes", icon: "content_paste", label: "Committee Echoes" },
                    { to: "/bills-laws", icon: "history_edu", label: "Bills & Laws" },
                  ].map(({ to, icon, label, badge }) => (
                    <Link
                      key={to + label}
                      to={to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 bg-white/5 hover:bg-amber-400/10 border border-white/8 hover:border-amber-400/30 rounded-xl px-3 py-3 text-xs font-semibold text-slate-300 hover:text-white transition-all group active:scale-[0.97]"
                    >
                      <span className="material-symbols-outlined text-[1.15em] shrink-0 opacity-55 group-hover:opacity-100 transition-opacity text-amber-400">{icon}</span>
                      <span className="leading-tight flex-1">{label}</span>
                      {badge && <span className="text-[7px] font-black text-red-400 border border-red-400/40 px-1 py-0.5 rounded shrink-0">{badge}</span>}
                    </Link>
                  ))}
                </div>
              </section>

              {/* ── DIPLOMACY & REGIONS ── */}
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-1 h-4 rounded-full bg-gold shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-gold">Diplomacy &amp; Regions</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { to: "/parliamentary-diplomacy", icon: "public", label: "Parliamentary Diplomacy" },
                    { to: "/constituency-actions", icon: "pin_drop", label: "Constituency Actions" },
                    { to: "/networking", icon: "handshake", label: "Networking" },
                    { to: "/interviews", icon: "mic", label: "Interviews" },
                  ].map(({ to, icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 bg-white/5 hover:bg-gold/10 border border-white/8 hover:border-gold/30 rounded-xl px-3 py-3 text-xs font-semibold text-slate-300 hover:text-white transition-all group active:scale-[0.97]"
                    >
                      <span className="material-symbols-outlined text-[1.15em] shrink-0 opacity-55 group-hover:opacity-100 transition-opacity text-gold">{icon}</span>
                      <span className="leading-tight">{label}</span>
                    </Link>
                  ))}
                </div>
              </section>

              {/* ── OPINIONS & MEDIA ── */}
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-1 h-4 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-400 font-bold">Opinions &amp; Media</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { to: "/opinion", icon: "draw", label: "Opinions" },
                    { to: "/video", icon: "videocam", label: "Video Gallery" },
                    { to: "/awards", icon: "emoji_events", label: "Annual Awards" },
                  ].map(({ to, icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 bg-white/5 hover:bg-amber-400/10 border border-white/8 hover:border-amber-400/30 rounded-xl px-3 py-3 text-xs font-semibold text-slate-300 hover:text-white transition-all group active:scale-[0.97]"
                    >
                      <span className="material-symbols-outlined text-[1.15em] shrink-0 opacity-55 group-hover:opacity-100 transition-opacity text-amber-400">{icon}</span>
                      <span className="leading-tight">{label}</span>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Premium CTA */}
              <Link
                to="/premium"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 text-xs font-black uppercase tracking-wider text-navy shadow-lg hover:brightness-105 transition-all active:scale-[0.98]"
              >
                <Crown className="size-4" />
                Subscribe to Digital Journal
              </Link>

            </div>
          </nav>

          {/* ── AUTH FOOTER ── */}
          <div className="shrink-0 px-4 py-3 bg-black/60 border-t border-white/10 flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-amber-400">{user.displayName?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">{user.displayName}</div>
                  <div className="text-[9px] text-amber-400 capitalize font-semibold">{user.role}</div>
                </div>
              </div>
            ) : (
              <Link to="/sign-in" onClick={() => setOpen(false)} className="text-[11px] text-amber-400 font-bold hover:underline">
                Sign In / Register →
              </Link>
            )}
            {user && (
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="text-[10px] font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Official Communiqué / Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-navy border-2 border-gold/60 max-w-lg w-full rounded-xl shadow-2xl overflow-hidden p-6 relative text-white">
            <button
              onClick={() => setSelectedAlert(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-widest mb-2">
              <span className="size-2 rounded-full bg-red-500 animate-ping" />
              Official Parliament Communiqué
            </div>
            <h3 className="text-xl font-serif font-bold text-white mt-1 leading-snug pr-6">
              {selectedAlert.alertTitle || selectedAlert.title?.replace(/^📢 Communique: /, "") || "Special Notice"}
            </h3>
            <div className="my-4 p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white/90 leading-relaxed max-h-60 overflow-y-auto scrollbar-thin">
              {selectedAlert.alertBody || selectedAlert.body || "Please review the latest broadcast from Parliament."}
            </div>
            {selectedAlert.alertBodyFr && (
              <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-white/80 italic">
                <span className="text-gold not-italic font-bold block mb-1">Français:</span>
                {selectedAlert.alertBodyFr}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-white/50 pt-3 border-t border-white/10">
              <span>Published: {selectedAlert.time || "Recent"}</span>
              <button
                onClick={() => setSelectedAlert(null)}
                className="bg-gold hover:bg-gold/90 text-navy-dark font-bold px-6 py-2 rounded uppercase tracking-wider transition-all shadow-lg text-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING LIVE PRESS BUTTON (Only visible when Admin enables Live) ── */}
      {isLive && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-live-player"))}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-full shadow-2xl font-black text-xs uppercase tracking-wider transition-all hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-red-500/30"
          >
            <span className="relative flex size-2.5">
              {isBlinking && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />}
              <span className="relative inline-flex rounded-full size-2.5 bg-white" />
            </span>
            <span>Live Press Stream</span>
          </button>
        </div>
      )}

    </header>
  );
}
