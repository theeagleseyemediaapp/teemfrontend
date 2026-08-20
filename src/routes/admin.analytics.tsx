import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { TrendingUp, Eye, MessageSquare, Heart, DollarSign, Wallet, Users, ArrowUpRight } from "lucide-react";
import { useAdminArticles, useAdminDashboard, useAdminArticleMetrics, useAdminFinancialMetrics } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";

export const Route = createFileRoute("/admin/analytics")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: AnalyticsPage,
});

const PALETTE = ["#050596", "#F5A623", "#0E7C7B", "#9333EA", "#DC2626", "#0EA5E9", "#16A34A"];

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-gold/10 rounded-lg">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
          <p className="text-2xl font-bold text-navy">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"content" | "financial">("content");
  const articles = useAdminArticles();
  const dash = useAdminDashboard();
  const metrics = useAdminArticleMetrics();
  const financial = useAdminFinancialMetrics();

  const items = (articles.data ?? []) as any[];

  // Articles published per day (last 30 days)
  const trend = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      return { day: key, label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), articles: 0 };
    });
    const idx = new Map(days.map((d, i) => [d.day, i]));
    for (const a of items) {
      const ts = a.publishedAt ?? a.createdAt;
      if (!ts) continue;
      const key = new Date(ts).toISOString().slice(0, 10);
      const i = idx.get(key);
      if (i !== undefined) days[i].articles += 1;
    }
    return days;
  }, [items]);

  // Category breakdown
  const byCat = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of items) {
      const k = a.categorySlug ?? "uncategorized";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [items]);

  // Top articles by likes/comments
  const top = useMemo(() => {
    return [...items]
      .map((a) => ({
        title: (a.title ?? "Untitled").slice(0, 40),
        likes: a.likes ?? 0,
        comments: a.commentCount ?? a.comments ?? 0,
      }))
      .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
      .slice(0, 8);
  }, [items]);

  const totals = dash.data ?? {};
  const articleMetrics = metrics.data ?? {};
  const finData = financial.data ?? { totalRevenue: 0, activeSubscriptions: 0, totalOrdersCount: 0, mtnRevenue: 0, orangeRevenue: 0, recentTransactions: [] };

  const payBreakdown = [
    { name: "MTN Money", revenue: finData.mtnRevenue ?? 0, fill: "#F5A623" },
    { name: "Orange Money", revenue: finData.orangeRevenue ?? 0, fill: "#DC2626" },
  ];

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="font-serif font-black text-3xl text-navy">Analytics</h1>
            <p className="text-sm text-muted-foreground">Monitor platform content and revenue performance.</p>
          </div>

          <div className="flex bg-muted p-1 rounded-lg self-start">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "content"
                  ? "bg-white text-navy shadow-sm"
                  : "text-muted-foreground hover:text-navy"
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("financial")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "financial"
                  ? "bg-white text-navy shadow-sm"
                  : "text-muted-foreground hover:text-navy"
              }`}
            >
              Financials
            </button>
          </div>
        </div>

        {activeTab === "content" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<TrendingUp className="size-4 text-gold" />} label="Published" value={`${(totals.published ?? 0).toLocaleString()}`} />
              <StatCard icon={<Eye className="size-4 text-gold" />} label="Article views (est.)" value={`${(articleMetrics.totalViews ?? items.length * 12).toLocaleString()}`} />
              <StatCard icon={<Heart className="size-4 text-gold" />} label="Likes" value={`${(totals.likes ?? items.reduce((s, a) => s + (a.likes ?? 0), 0)).toLocaleString()}`} />
              <StatCard icon={<MessageSquare className="size-4 text-gold" />} label="Comments" value={`${(totals.comments ?? 0).toLocaleString()}`} />
            </div>

            <Card>
              <CardHeader><CardTitle>Publishing trend (last 30 days)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={3} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="articles" stroke="#050596" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>By category</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(e: any) => e.name}>
                          {byCat.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Top articles (likes + comments)</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={top} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="title" width={140} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="likes" stackId="a" fill="#F5A623" />
                        <Bar dataKey="comments" stackId="a" fill="#050596" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard icon={<DollarSign className="size-4 text-gold" />} label="Total Revenue" value={`${(finData.totalRevenue ?? 0).toLocaleString()} XAF`} />
              <StatCard icon={<Users className="size-4 text-gold" />} label="Active Subscribers" value={`${(finData.activeSubscriptions ?? 0).toLocaleString()}`} />
              <StatCard icon={<ArrowUpRight className="size-4 text-gold" />} label="Completed Orders" value={`${(finData.totalOrdersCount ?? 0).toLocaleString()}`} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1.8fr]">
              <Card>
                <CardHeader><CardTitle>MoMo Carrier Share</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={payBreakdown} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => `${v.toLocaleString()} XAF`} />
                        <Bar dataKey="revenue">
                          {payBreakdown.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Recent MoMo Sales</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 font-semibold">
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Provider</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {financial.isLoading && <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Loading transactions...</td></tr>}
                        {!financial.isLoading && (!finData.recentTransactions || finData.recentTransactions.length === 0) && (
                          <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No momo transactions yet.</td></tr>
                        )}
                        {(finData.recentTransactions ?? []).map((t: any) => (
                          <tr key={t.id} className="hover:bg-muted/10">
                            <td className="p-3 font-mono text-xs text-muted-foreground">{t.id.slice(0, 8)}</td>
                            <td className="p-3 font-semibold">{t.payerPhone}</td>
                            <td className="p-3 uppercase text-xs">{t.provider || "momo"}</td>
                            <td className="p-3 font-bold text-navy">{t.amountXaf.toLocaleString()} XAF</td>
                            <td className="p-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                t.status === "completed" ? "bg-green-50 text-green-700 border border-green-200" :
                                t.status === "failed" ? "bg-red-50 text-red-700 border border-red-200" :
                                "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
  );
}
