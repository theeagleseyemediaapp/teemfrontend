import {
  createFileRoute,
  Link,
  redirect,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText, MessageSquare, AlertCircle, Users, BarChart3,
} from "lucide-react";
import { useAdminMetrics, useAdminDashboard } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { MaterialIcon } from "@/components/ui/material-icon";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const user = getStoredUser();
    if (!user) {
      throw redirect({ to: "/sign-in" });
    }
    if (user.role !== "admin" && user.role !== "editor" && user.role !== "super_admin") {
      throw redirect({ to: "/" });
    }
  },
  component: AdminShell,
});

function AdminShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminIndex = pathname === "/admin";
  const metrics = useAdminMetrics();
  const dashboard = useAdminDashboard();
  const stats = metrics.data ?? {};
  const dashStats = dashboard.data ?? {};

  const articleStatusData = [
    { name: "Published", value: dashStats.published ?? 0 },
    { name: "Drafts", value: dashStats.drafts ?? 0 },
  ];

  const systemData = [
    { name: "Comments", value: dashStats.comments ?? 0 },
    { name: "Media Assets", value: dashStats.media ?? 0 },
    { name: "AI Requests", value: dashStats.aiRequests ?? 0 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {isAdminIndex ? (
          <>
            <h1 className="font-serif font-black text-3xl text-navy">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <Link to="/admin/posts" className="block">
                <Card className="hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MaterialIcon name="article" className="text-amber-500" size={20} />
                      Published
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy dark:text-white">{metrics.isLoading ? "…" : (stats.publishedArticles ?? 0)}</div>
                    <p className="text-[11px] text-muted-foreground mt-1">of {metrics.isLoading ? "…" : (stats.articles ?? 0)} total</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/admin/banners" className="block">
                <Card className="hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MaterialIcon name="ad_units" className="text-blue-500" size={20} />
                      Ad Banners
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy dark:text-white">Rotator</div>
                    <p className="text-[11px] text-muted-foreground mt-1">Manage header ads</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/admin/comments" className="block">
                <Card className="hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MaterialIcon name="forum" className="text-emerald-500" size={20} />
                      Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy dark:text-white">{metrics.isLoading ? "…" : (stats.comments ?? 0)}</div>
                    <p className="text-[11px] text-muted-foreground mt-1">total moderation</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/admin/announcements" className="block">
                <Card className="hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MaterialIcon name="campaign" className="text-red-500" size={20} />
                      Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy dark:text-white">{metrics.isLoading ? "…" : (stats.alerts ?? 0)}</div>
                    <p className="text-[11px] text-muted-foreground mt-1">active notices</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/admin/api" className="block">
                <Card className="hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MaterialIcon name="dns" className="text-purple-500" size={20} />
                      API Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy dark:text-white">100% OK</div>
                    <p className="text-[11px] text-muted-foreground mt-1">Endpoints &amp; Probes</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/admin/users" className="block">
                <Card className="hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MaterialIcon name="group" className="text-indigo-500" size={20} />
                      Users & Staff
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy dark:text-white">{metrics.isLoading ? "…" : (stats.users ?? 0)}</div>
                    <p className="text-[11px] text-muted-foreground mt-1">registered accounts</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/admin/newsletter" className="block">
                <Card className="hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MaterialIcon name="mark_email_unread" className="text-violet-500" size={20} />
                      Newsletter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy dark:text-white">{metrics.isLoading ? "…" : (stats.newsletterSubscribers ?? 0)}</div>
                    <p className="text-[11px] text-muted-foreground mt-1">subscribers</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{dashboard.isLoading ? "…" : (dashStats.articles ?? 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{dashboard.isLoading ? "…" : (dashStats.likes ?? 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Media Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{dashboard.isLoading ? "…" : (dashStats.media ?? 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{dashboard.isLoading ? "…" : (dashStats.aiRequests ?? 0)}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-4" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Article Status</h3>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={articleStatusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">System Usage</h3>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={systemData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
        <Outlet />
      </div>
    </AdminLayout>
  );
}
