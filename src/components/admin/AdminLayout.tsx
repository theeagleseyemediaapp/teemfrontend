import { type ReactNode, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Home, LogOut, Download, Smartphone, CheckCircle2 } from "lucide-react";
import { useAuthState } from "@/components/auth/useAuthState";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useAdminPwa } from "@/hooks/useAdminPwa";
import { toast } from "sonner";

const adminLogoUrl = "/admin-logo-192.png";

interface NavGroup {
  title: string;
  items: Array<{
    to: string;
    label: string;
    icon: string;
    badge?: string;
  }>;
}

const ADMIN_GROUPS: NavGroup[] = [
  {
    title: "Overview & Finance",
    items: [
      { to: "/admin", label: "Dashboard", icon: "dashboard" },
      { to: "/admin/analytics", label: "Analytics & Traffic", icon: "analytics" },
      { to: "/admin/finance", label: "Finance Management", icon: "account_balance_wallet" },
    ],
  },
  {
    title: "Content & Editorial",
    items: [
      { to: "/admin/posts", label: "Posts Management", icon: "article" },
      { to: "/admin/posts/create", label: "Create Post", icon: "edit_note" },
      { to: "/admin/authors", label: "Authors & Writers", icon: "badge" },
      { to: "/admin/magazines", label: "Magazines & E-Paper", icon: "auto_stories" },
      { to: "/admin/comments", label: "Comments Moderation", icon: "forum" },
      { to: "/admin/media", label: "Media Library", icon: "perm_media" },
    ],
  },
  {
    title: "Communications & Live",
    items: [
      { to: "/admin/announcements", label: "Notices & Broadcasts", icon: "campaign" },
      { to: "/admin/newsletter", label: "Newsletter Subscribers", icon: "mark_email_unread" },
      { to: "/admin/live", label: "Live Manager", icon: "live_tv", badge: "LIVE" },
      { to: "/admin/support", label: "Support Messages", icon: "support_agent" },
    ],
  },
  {
    title: "Monetization & Ads",
    items: [
      { to: "/admin/premium", label: "Premium Subscriptions", icon: "workspace_premium" },
      { to: "/admin/banners", label: "Ad Banners & Rotator", icon: "ad_units" },
    ],
  },
  {
    title: "Access & Staff",
    items: [
      { to: "/admin/users", label: "Users & Roles (RBAC)", icon: "security" },
      { to: "/admin/employees", label: "Employee Directory", icon: "badge" },
      { to: "/admin/mps", label: "MPs & Parties", icon: "how_to_vote" },
    ],
  },
  {
    title: "System & Tools",
    items: [
      { to: "/admin/api", label: "Backend API & Health", icon: "dns" },
      { to: "/admin/ai", label: "Eagle AI Research", icon: "auto_awesome" },
      { to: "/admin/seo", label: "SEO & Social Tags", icon: "manage_search" },
      { to: "/admin/settings", label: "Site Settings", icon: "settings" },
    ],
  },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuthState();
  const { isInstallable, isInstalled, promptInstall } = useAdminPwa();

  const handleInstallClick = async () => {
    const installed = await promptInstall();
    if (installed) {
      toast.success("Admin Portal app installed to your home screen / desktop!");
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Top navbar — fixed height */}
      <header className="flex-none bg-navy text-white border-b border-white/10 z-40">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1 text-white hover:text-amber-400" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <img src={adminLogoUrl} alt="Admin Portal" className="size-8 rounded-lg shadow-sm ring-1 ring-amber-400/40" />
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-sm hidden sm:inline tracking-tight">Admin · The Eagle's Eye</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30">
                PWA
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            {/* PWA Install Action in Top Bar */}
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-3 py-1 rounded-full shadow-sm text-xs transition-all active:scale-95"
                title="Install Admin Portal as standalone Desktop / Mobile App"
              >
                <Download className="size-3.5" />
                <span>Install Admin App</span>
              </button>
            )}

            {isInstalled && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="size-3" /> Standalone App
              </span>
            )}

            <Link to="/" className="inline-flex items-center gap-1.5 text-slate-200 hover:text-amber-400 transition-colors">
              <Home className="size-4" /> <span className="hidden sm:inline">View Site</span>
            </Link>
            {user && (
              <button onClick={signOut} className="inline-flex items-center gap-1.5 text-slate-200 hover:text-amber-400 transition-colors">
                <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Body: sidebar + main — fills remaining height */}
      <div className="flex flex-1 min-h-0">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar — scrolls independently */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-navy text-white flex flex-col transform transition-transform duration-200
          lg:relative lg:translate-x-0 lg:z-auto lg:flex-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="lg:hidden flex justify-end p-3 flex-none">
            <button onClick={() => setSidebarOpen(false)} aria-label="Close" className="text-white hover:text-amber-400">
              <X className="size-5" />
            </button>
          </div>

          {/* Brand Header */}
          <div className="p-4 pb-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={adminLogoUrl} alt="Admin Portal" className="size-9 rounded-lg shadow-md ring-2 ring-amber-400/50" />
              <div>
                <div className="font-serif font-black text-sm text-white leading-tight">ADMIN CONTROL</div>
                <div className="text-[0.65rem] text-amber-400 font-bold uppercase tracking-widest">Parliament Desk</div>
              </div>
            </div>
          </div>

          {/* PWA Install Banner inside Sidebar */}
          {isInstallable && (
            <div className="mx-3 mt-3 p-2.5 rounded-xl bg-gradient-to-br from-amber-400/15 via-navy to-slate-900 border border-amber-400/30 flex items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Smartphone className="size-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">Admin Web App</div>
                  <div className="text-[9px] text-slate-300">Install to your device</div>
                </div>
              </div>
              <button
                onClick={handleInstallClick}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-lg shadow transition-all active:scale-95"
              >
                Install
              </button>
            </div>
          )}

          {/* Scrollable nav */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {ADMIN_GROUPS.map((group) => (
              <div key={group.title} className="space-y-1">
                <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-amber-400/80 mb-2">
                  {group.title}
                </h3>
                {group.items.map((item) => {
                  const active = location === item.to || (item.to !== "/admin" && location.startsWith(item.to));
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between px-3 py-2 rounded text-xs font-semibold transition-all ${
                        active
                          ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                          : "text-slate-200 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className="flex items-center gap-2.5">
                        <MaterialIcon name={item.icon} size={18} className={active ? "text-slate-950" : "text-slate-400"} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-500 text-white uppercase">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sticky user footer */}
          <div className="flex-none p-3 border-t border-white/10 text-xs text-slate-300 flex items-center gap-2.5 bg-navy/80">
            <div className="size-7 rounded-full bg-amber-400 text-navy font-black text-xs flex items-center justify-center ring-2 ring-amber-400/50 shadow-sm shrink-0">
              {user?.displayName?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="truncate font-medium">{user ? `${user.displayName} (${user.role})` : "Not signed in"}</span>
          </div>
        </aside>

        {/* Main content — scrolls independently */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
