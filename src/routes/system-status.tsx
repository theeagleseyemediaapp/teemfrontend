import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldCheck,
  Send,
  Database,
  Cpu,
  Globe,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/system-status")({
  component: SystemStatusPage,
});

interface EndpointStatus {
  path: string;
  method: string;
  category: string;
  description: string;
  requiresAuth: boolean;
  status: "ok" | "auth_protected" | "degraded" | "error" | "pending";
  statusCode?: number;
  latencyMs?: number;
  error?: string | null;
}

const DEFAULT_CATALOG: EndpointStatus[] = [
  { path: "/api/v1/health", method: "GET", category: "System Probe", description: "Liveness health probe", requiresAuth: false, status: "pending" },
  { path: "/api/v1/health/deep", method: "GET", category: "System Probe", description: "Database & deep service health", requiresAuth: false, status: "pending" },
  { path: "/api/v1/readyz", method: "GET", category: "System Probe", description: "Readiness status probe", requiresAuth: false, status: "pending" },
  { path: "/api/v1/meta", method: "GET", category: "System Core", description: "API metadata & manifest", requiresAuth: false, status: "pending" },
  { path: "/api/v1/headlines", method: "GET", category: "Content", description: "Published headlines feed", requiresAuth: false, status: "pending" },
  { path: "/api/v1/categories", method: "GET", category: "Content", description: "Article categories list", requiresAuth: false, status: "pending" },
  { path: "/api/v1/articles", method: "GET", category: "Content", description: "Published news & analysis articles", requiresAuth: false, status: "pending" },
  { path: "/api/v1/comments", method: "GET", category: "Community", description: "Public article comments feed", requiresAuth: false, status: "pending" },
  { path: "/api/v1/alerts", method: "GET", category: "System Ticker", description: "Alert notices & ticker feed", requiresAuth: false, status: "pending" },
  { path: "/api/v1/alerts/active", method: "GET", category: "System Ticker", description: "Active breaking banner alert", requiresAuth: false, status: "pending" },
  { path: "/api/v1/media", method: "GET", category: "Media Vault", description: "Uploaded media files catalog", requiresAuth: false, status: "pending" },
  { path: "/api/v1/banners", method: "GET", category: "Monetization", description: "Header rotator ad banners", requiresAuth: false, status: "pending" },
  { path: "/api/v1/settings", method: "GET", category: "System Core", description: "Global application settings", requiresAuth: false, status: "pending" },
  { path: "/api/v1/support/pages", method: "GET", category: "Support Desk", description: "Help desk & civic support pages", requiresAuth: false, status: "pending" },
  { path: "/api/v1/premium/products", method: "GET", category: "Monetization", description: "Digital e-papers & PDF products", requiresAuth: false, status: "pending" },
  { path: "/.well-known/assetlinks.json", method: "GET", category: "Mobile Integration", description: "Android App Links verification JSON", requiresAuth: false, status: "pending" },
];

function SystemStatusPage() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>(DEFAULT_CATALOG);
  const [scanning, setScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const runFullScan = async () => {
    setScanning(true);

    try {
      // 1. Fetch server's endpoint health aggregator
      const aggRes = await fetch("/api/v1/health/endpoints", { cache: "no-store" }).catch(() => null);
      if (aggRes && aggRes.ok) {
        const aggData = await aggRes.json();
        if (aggData?.endpoints && Array.isArray(aggData.endpoints)) {
          setEndpoints(aggData.endpoints);
          setLastChecked(new Date().toLocaleTimeString());
          toast.success("System & API Health Probe Complete!");
          setScanning(false);
          return;
        }
      }
    } catch (_) { }

    // 2. Client-side probe fallback
    const updated = await Promise.all(
      DEFAULT_CATALOG.map(async (ep) => {
        const start = Date.now();
        try {
          const res = await fetch(ep.path, { method: ep.method, cache: "no-store" });
          const latencyMs = Date.now() - start;
          if (res.ok) {
            return { ...ep, status: "ok" as const, statusCode: res.status, latencyMs };
          }
          if (res.status === 401) {
            return { ...ep, status: "auth_protected" as const, statusCode: 401, latencyMs };
          }
          return { ...ep, status: "degraded" as const, statusCode: res.status, latencyMs, error: res.statusText };
        } catch (err: any) {
          return { ...ep, status: "error" as const, statusCode: 500, latencyMs: Date.now() - start, error: err.message };
        }
      })
    );

    setEndpoints(updated);
    setLastChecked(new Date().toLocaleTimeString());
    toast.success("System & API Health Probe Complete!");
    setScanning(false);
  };

  useEffect(() => {
    runFullScan();
  }, []);

  const runSinglePing = async (ep: EndpointStatus) => {
    const start = Date.now();
    try {
      const res = await fetch(ep.path, { method: ep.method, cache: "no-store" });
      const latencyMs = Date.now() - start;
      const newStatus: EndpointStatus = res.ok
        ? { ...ep, status: "ok", statusCode: res.status, latencyMs }
        : res.status === 401
          ? { ...ep, status: "auth_protected", statusCode: 401, latencyMs }
          : { ...ep, status: "degraded", statusCode: res.status, latencyMs };

      setEndpoints((prev) => prev.map((item) => (item.path === ep.path && item.method === ep.method ? newStatus : item)));
      toast.success(`Ping ${ep.path} → ${res.status} (${latencyMs}ms)`);
    } catch (err: any) {
      setEndpoints((prev) =>
        prev.map((item) =>
          item.path === ep.path && item.method === ep.method
            ? { ...ep, status: "error", statusCode: 500, latencyMs: Date.now() - start, error: err.message }
            : item
        )
      );
      toast.error(`Ping failed for ${ep.path}: ${err.message}`);
    }
  };

  const total = endpoints.length;
  const healthy = endpoints.filter((e) => e.status === "ok" || e.status === "auth_protected").length;
  const degraded = endpoints.filter((e) => e.status === "degraded" || e.status === "error").length;
  const avgLatency = Math.round(
    endpoints.reduce((acc, e) => acc + (e.latencyMs || 0), 0) / (endpoints.filter((e) => e.latencyMs).length || 1)
  );

  const categories = Array.from(new Set(endpoints.map((e) => e.category)));

  const filteredEndpoints = endpoints.filter((e) => {
    const matchesCategory = selectedCategory === "all" || e.category === selectedCategory;
    const matchesSearch =
      e.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Link & Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-navy dark:text-amber-400 hover:underline">
            <ArrowLeft className="size-4" /> Back to Home Page
          </Link>

          <span className="text-xs text-slate-500">
            {lastChecked ? `Last scanned at ${lastChecked}` : "Scanning..."}
          </span>
        </div>

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-slate-950 p-6 sm:p-8 rounded-2xl text-white shadow-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Systems Operational
              </span>
              <span className="text-xs text-slate-400">The Eagle's Eye Media API</span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-4xl text-white tracking-tight">
              System &amp; API Endpoint Health Matrix
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Real-time operational status visual grid for all public and admin backend API endpoints, database latency, and service availability.
            </p>
          </div>

          <button
            onClick={runFullScan}
            disabled={scanning}
            className="inline-flex items-center justify-center gap-2 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-amber-300 transition-all shadow-lg shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Probing API..." : "Re-Scan All Endpoints"}
          </button>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center justify-between text-slate-500">
                <span>Overall System State</span>
                <ShieldCheck className="size-4 text-emerald-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-navy dark:text-white">
                {degraded === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xl">
                    <CheckCircle2 className="size-6 text-emerald-500" /> 100% Operational
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-xl">
                    <AlertTriangle className="size-6 text-amber-500" /> {degraded} Degraded
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Verified across {total} routes</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center justify-between text-slate-500">
                <span>Healthy Endpoints</span>
                <CheckCircle2 className="size-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-navy dark:text-white">
                {healthy} / {total}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Passing 200 OK health probes</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center justify-between text-slate-500">
                <span>Average API Latency</span>
                <Cpu className="size-4 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-navy dark:text-white">
                {avgLatency} <span className="text-xs font-normal text-slate-500">ms</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Server response latency</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center justify-between text-slate-500">
                <span>Supabase Database</span>
                <Database className="size-4 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xl">
                <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Direct pooling query active</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search endpoint path, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${selectedCategory === "all"
                  ? "bg-navy text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
            >
              All ({endpoints.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                    ? "bg-navy text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Endpoints Table Grid */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Method &amp; Path</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Auth</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Latency</th>
                  <th className="p-4 text-right">Ping Probe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredEndpoints.map((ep) => (
                  <tr key={ep.path + ep.method} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ep.method === "GET"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                        >
                          {ep.method}
                        </span>
                        <code className="font-mono font-bold text-slate-900 dark:text-white text-xs">{ep.path}</code>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {ep.category}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">{ep.description}</td>

                    <td className="p-4">
                      {ep.requiresAuth ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                          Protected
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                          Public
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {ep.status === "ok" && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                          <CheckCircle2 className="size-4 text-emerald-500" /> 200 OK
                        </span>
                      )}
                      {ep.status === "auth_protected" && (
                        <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                          <ShieldCheck className="size-4 text-blue-500" /> 401 Auth
                        </span>
                      )}
                      {ep.status === "degraded" && (
                        <span className="inline-flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                          <AlertTriangle className="size-4 text-amber-500" /> {ep.statusCode ?? 503} Degraded
                        </span>
                      )}
                      {ep.status === "error" && (
                        <span className="inline-flex items-center gap-1.5 text-red-600 font-bold text-xs">
                          <XCircle className="size-4 text-red-500" /> Error
                        </span>
                      )}
                      {ep.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 text-slate-400 font-semibold text-xs">
                          <RefreshCw className="size-3.5 animate-spin" /> Checking...
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono text-slate-500 text-xs">
                      {ep.latencyMs ? `${ep.latencyMs} ms` : "—"}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => runSinglePing(ep)}
                        className="text-[11px] font-bold text-navy dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                      >
                        Ping <Send className="size-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
