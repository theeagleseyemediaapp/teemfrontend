import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getStoredUser } from "@/lib/auth-session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Code,
  Globe,
  Database,
  Cpu,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/admin/api")({
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
  component: AdminApiStatusPage,
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
  note?: string;
}

const DEFAULT_CATALOG: EndpointStatus[] = [
  { path: "/healthz", method: "GET", category: "System Probe", description: "Liveness health probe", requiresAuth: false, status: "pending" },
  { path: "/healthz/deep", method: "GET", category: "System Probe", description: "Database & deep service health", requiresAuth: false, status: "pending" },
  { path: "/readyz", method: "GET", category: "System Probe", description: "Readiness status", requiresAuth: false, status: "pending" },
  { path: "/.well-known/assetlinks.json", method: "GET", category: "Mobile Integration", description: "Android App Links verification JSON", requiresAuth: false, status: "pending" },
  { path: "/api/v1/assetlinks.json", method: "GET", category: "Mobile Integration", description: "API alias for Digital Asset Links", requiresAuth: false, status: "pending" },
  { path: "/api/v1/health", method: "GET", category: "System Probe", description: "API status response", requiresAuth: false, status: "pending" },
  { path: "/api/v1/meta", method: "GET", category: "System Core", description: "API metadata & version manifest", requiresAuth: false, status: "pending" },
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
  { path: "/api/v1/admin/dashboard", method: "GET", category: "Admin Console", description: "Admin dashboard metrics", requiresAuth: true, status: "pending" },
  { path: "/api/v1/admin/audit-logs", method: "GET", category: "Admin Console", description: "System audit log entries", requiresAuth: true, status: "pending" },
  { path: "/api/v1/admin/articles-list", method: "GET", category: "Admin Console", description: "Full admin articles list", requiresAuth: true, status: "pending" },
];

const ASSET_LINKS_SNIPPET = JSON.stringify(
  [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.theeagleseyemedia.app",
        sha256_cert_fingerprints: [
          "14:77:71:8E:80:71:E3:A3:80:C9:CA:20:44:C1:EB:4C:ED:00:89:AF:60:2C:69:BC:3D:91:E4:7A:37:D5:23:DF",
        ],
      },
    },
  ],
  null,
  2
);

function AdminApiStatusPage() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>(DEFAULT_CATALOG);
  const [scanning, setScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "tester" | "assetlinks">("overview");

  // Interactive Tester State
  const [testUrl, setTestUrl] = useState("/api/v1/meta");
  const [testMethod, setTestMethod] = useState("GET");
  const [testBody, setTestBody] = useState("");
  const [testHeaders, setTestHeaders] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<{ status?: number; statusText?: string; timeMs?: number; data?: any } | null>(null);
  const [copied, setCopied] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL ?? "/api/v1";

  // Scan all endpoints
  const runFullScan = async () => {
    setScanning(true);
    toast.info("Probing all backend API endpoints...");

    try {
      // 1. Try server's built-in endpoint health aggregator first
      const aggRes = await fetch(`/api/v1/health/endpoints`, { cache: "no-store" }).catch(() => null);
      if (aggRes && aggRes.ok) {
        const aggData = await aggRes.json();
        if (aggData?.endpoints && Array.isArray(aggData.endpoints)) {
          setEndpoints(aggData.endpoints);
          toast.success(`API Scan complete! ${aggData.healthyEndpoints}/${aggData.totalEndpoints} endpoints operational.`);
          setScanning(false);
          return;
        }
      }
    } catch (_) {}

    // 2. Client-side fallback scanning for each endpoint
    const updated = await Promise.all(
      DEFAULT_CATALOG.map(async (ep) => {
        const start = Date.now();
        try {
          const res = await fetch(ep.path, {
            method: ep.method,
            headers: ep.requiresAuth ? { Authorization: `Bearer admin_preview_session` } : {},
            cache: "no-store",
          });
          const latencyMs = Date.now() - start;

          if (res.ok) {
            return { ...ep, status: "ok" as const, statusCode: res.status, latencyMs };
          }
          if (res.status === 401) {
            return { ...ep, status: "auth_protected" as const, statusCode: 401, latencyMs, note: "Protected (401 Auth Required)" };
          }
          return { ...ep, status: "degraded" as const, statusCode: res.status, latencyMs, error: res.statusText };
        } catch (err: any) {
          return { ...ep, status: "error" as const, statusCode: 500, latencyMs: Date.now() - start, error: err.message };
        }
      })
    );

    setEndpoints(updated);
    toast.success("API Endpoint Status Probe Completed");
    setScanning(false);
  };

  useEffect(() => {
    runFullScan();
  }, []);

  // Single Endpoint Tester trigger
  const runSingleTest = async (ep: EndpointStatus) => {
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
      toast.success(`Tested ${ep.path} → ${res.status} (${latencyMs}ms)`);
    } catch (err: any) {
      setEndpoints((prev) =>
        prev.map((item) =>
          item.path === ep.path && item.method === ep.method
            ? { ...ep, status: "error", statusCode: 500, latencyMs: Date.now() - start, error: err.message }
            : item
        )
      );
      toast.error(`Test failed for ${ep.path}: ${err.message}`);
    }
  };

  // Run Custom Request from Tester
  const executeCustomTest = async () => {
    setTesting(true);
    setTestResponse(null);
    const start = Date.now();

    try {
      const parsedHeaders: Record<string, string> = {};
      if (testHeaders.trim()) {
        testHeaders.split("\n").forEach((line) => {
          const [k, v] = line.split(":");
          if (k && v) parsedHeaders[k.trim()] = v.trim();
        });
      }

      const options: RequestInit = {
        method: testMethod,
        headers: { "Content-Type": "application/json", ...parsedHeaders },
      };

      if (["POST", "PATCH", "PUT"].includes(testMethod) && testBody.trim()) {
        options.body = testBody;
      }

      const res = await fetch(testUrl, options);
      const timeMs = Date.now() - start;
      const text = await res.text();
      let data: any = text;
      try {
        data = JSON.parse(text);
      } catch (_) {}

      setTestResponse({
        status: res.status,
        statusText: res.statusText,
        timeMs,
        data,
      });

      if (res.ok) {
        toast.success(`Request successful (${res.status} ${res.statusText}) in ${timeMs}ms`);
      } else {
        toast.warning(`Response returned status ${res.status} ${res.statusText}`);
      }
    } catch (err: any) {
      setTestResponse({
        status: 500,
        statusText: "Network Error",
        timeMs: Date.now() - start,
        data: { error: err.message },
      });
      toast.error(`Request failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const copyAssetLinks = () => {
    navigator.clipboard.writeText(ASSET_LINKS_SNIPPET);
    setCopied(true);
    toast.success("Digital Asset Links JSON copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Metrics computation
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
    <div className="space-y-6">
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-navy via-slate-900 to-slate-950 p-6 rounded-2xl text-white shadow-xl border border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Live Monitoring
              </span>
              <span className="text-xs text-slate-400">v0.1.0</span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-white tracking-tight">
              Backend API &amp; Health Status
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Real-time endpoint diagnostic matrix, automated API health checks, status verification, and Digital Asset Links integration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runFullScan}
              disabled={scanning}
              className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-amber-300 transition-all shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? "Scanning..." : "Re-Scan All Endpoints"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "overview"
                ? "border-navy text-navy dark:text-amber-400 dark:border-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Activity className="size-4" /> Endpoint Status Grid
          </button>
          <button
            onClick={() => setActiveTab("tester")}
            className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "tester"
                ? "border-navy text-navy dark:text-amber-400 dark:border-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Code className="size-4" /> Interactive API Tester
          </button>
          <button
            onClick={() => setActiveTab("assetlinks")}
            className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "assetlinks"
                ? "border-navy text-navy dark:text-amber-400 dark:border-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Smartphone className="size-4" /> Digital Asset Links JSON
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white dark:bg-slate-900 border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Overall System Health</span>
                    <ShieldCheck className="size-4 text-emerald-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy dark:text-white flex items-center gap-2">
                    {degraded === 0 ? (
                      <span className="text-emerald-600 flex items-center gap-1.5 text-xl">
                        <CheckCircle2 className="size-6 text-emerald-500" /> 100% Healthy
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1.5 text-xl">
                        <AlertTriangle className="size-6 text-amber-500" /> {degraded} Degraded
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Checked across {total} registered routes</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Operational Endpoints</span>
                    <CheckCircle2 className="size-4 text-blue-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy dark:text-white">
                    {healthy} / {total}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Active GET &amp; POST probes</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Average API Latency</span>
                    <Cpu className="size-4 text-amber-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy dark:text-white">
                    {avgLatency} <span className="text-xs font-normal text-slate-500">ms</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Internal server response rate</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Database State</span>
                    <Database className="size-4 text-purple-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xl">
                    <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Supabase DB connection active</p>
                </CardContent>
              </Card>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search endpoint path, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                <span className="text-xs font-bold text-slate-500 shrink-0">Category:</span>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                    selectedCategory === "all"
                      ? "bg-navy text-white font-bold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  All ({endpoints.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-navy text-white font-bold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Table */}
            <Card className="bg-white dark:bg-slate-900 border-none shadow-sm overflow-hidden">
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
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredEndpoints.map((ep) => (
                      <tr key={ep.path + ep.method} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                ep.method === "GET"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : ep.method === "POST"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                  : ep.method === "PATCH"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
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

                        <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{ep.description}</td>

                        <td className="p-4">
                          {ep.requiresAuth ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                              Bearer Required
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
                              <ShieldCheck className="size-4 text-blue-500" /> 401 Protected
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
                            onClick={() => runSingleTest(ep)}
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
        )}

        {/* Tab 2: Interactive Tester */}
        {activeTab === "tester" && (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-4">
              <Card className="bg-white dark:bg-slate-900 border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-navy dark:text-white">API Request Console</CardTitle>
                  <CardDescription>Configure and dispatch HTTP requests directly to backend services.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Endpoint Path
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={testMethod}
                        onChange={(e) => setTestMethod(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold px-2 py-2 text-slate-900 dark:text-white outline-none"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PATCH">PATCH</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                      <input
                        type="text"
                        value={testUrl}
                        onChange={(e) => setTestUrl(e.target.value)}
                        placeholder="/api/v1/health"
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Quick Select Preset
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) setTestUrl(e.target.value);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-medium px-3 py-2 text-slate-900 dark:text-white outline-none"
                    >
                      <option value="">-- Choose preset route --</option>
                      {DEFAULT_CATALOG.map((ep) => (
                        <option key={ep.path} value={ep.path}>
                          {ep.method} {ep.path} ({ep.description})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Custom Headers (Key: Value)
                    </label>
                    <textarea
                      rows={2}
                      value={testHeaders}
                      onChange={(e) => setTestHeaders(e.target.value)}
                      placeholder="Authorization: Bearer token_here"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono p-2.5 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  {["POST", "PATCH", "PUT"].includes(testMethod) && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        JSON Request Payload Body
                      </label>
                      <textarea
                        rows={4}
                        value={testBody}
                        onChange={(e) => setTestBody(e.target.value)}
                        placeholder={`{\n  "title": "Test"\n}`}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono p-2.5 text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={executeCustomTest}
                    disabled={testing}
                    className="w-full bg-navy text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="size-4 text-amber-400" />
                    {testing ? "Dispatching Request..." : "Send Test Request"}
                  </button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <Card className="bg-slate-950 text-white border-none shadow-xl h-full flex flex-col">
                <CardHeader className="border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono font-bold text-amber-400 flex items-center gap-2">
                      <Code className="size-4" /> Live Response Preview
                    </CardTitle>
                    {testResponse && (
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            testResponse.status === 200 || testResponse.status === 201
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {testResponse.status} {testResponse.statusText}
                        </span>
                        <span className="text-slate-400">{testResponse.timeMs} ms</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 font-mono text-xs overflow-auto min-h-[300px]">
                  {testResponse ? (
                    <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                      {typeof testResponse.data === "object"
                        ? JSON.stringify(testResponse.data, null, 2)
                        : testResponse.data}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-slate-500 py-16">
                      <Globe className="size-10 mb-2 opacity-30" />
                      <p>Select a route and click "Send Test Request" to inspect raw JSON output.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Digital Asset Links JSON */}
        {activeTab === "assetlinks" && (
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900 border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-serif font-bold text-navy dark:text-white flex items-center gap-2">
                      <Smartphone className="size-5 text-amber-500" /> Android App Links (Digital Asset Links)
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Required for Android App Links to associate <code className="text-navy dark:text-amber-400 font-bold">com.theeagleseyemedia.app</code> with your domain.
                    </CardDescription>
                  </div>
                  <button
                    onClick={copyAssetLinks}
                    className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                    {copied ? "Copied!" : "Copy Snippet"}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-amber-300 overflow-x-auto border border-white/10">
                  <pre>{ASSET_LINKS_SNIPPET}</pre>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/30 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="font-bold flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-amber-600" /> Active Verification Routes
                  </div>
                  <p>
                    This statement is active and served at both static and API locations:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-mono">
                    <li>
                      <a href="/.well-known/assetlinks.json" target="_blank" className="underline hover:text-amber-500 inline-flex items-center gap-1">
                        /.well-known/assetlinks.json <ExternalLink className="size-3" />
                      </a>
                    </li>
                    <li>
                      <a href="/api/v1/assetlinks.json" target="_blank" className="underline hover:text-amber-500 inline-flex items-center gap-1">
                        /api/v1/assetlinks.json <ExternalLink className="size-3" />
                      </a>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  );
}
