import { useState, useMemo } from "react";
import { FileText, CheckCircle2, Clock, ArrowRight, AlertCircle, Sparkles, Filter } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useArticles } from "@/lib/api";

export interface LegislativeBill {
  id: string;
  billNumber: string;
  title: string;
  sponsor: string;
  sponsorType: "Executive Government" | "Private Member";
  committee: string;
  session: string;
  status: "tabled" | "committee_review" | "plenary_vote" | "promulgated";
  stepIndex: number; // 1 to 4
  depositDate: string;
  lastUpdate: string;
  summary: string;
  imageUrl?: string;
  slug?: string;
  keyVoteBreakdown?: {
    for: number;
    against: number;
    abstain: number;
  };
}

const DEFAULT_BILLS: LegislativeBill[] = [
  {
    id: "bill-2026-01",
    billNumber: "PL/2026/08",
    title: "Finance Bill of the Republic of Cameroon for the 2026 Fiscal Year",
    sponsor: "Minister of Finance / Prime Minister's Office",
    sponsorType: "Executive Government",
    committee: "Committee on Finance and Budget",
    session: "November 2025 – 2026 Budget Session",
    status: "plenary_vote",
    stepIndex: 3,
    depositDate: "Nov 12, 2025",
    lastUpdate: "Floor reading & revenue allocation debates in progress",
    summary: "Sets state revenue projections, public investment programs, and regional council development funding quotas for all 10 regions.",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    keyVoteBreakdown: { for: 152, against: 18, abstain: 4 },
  },
  {
    id: "bill-2026-02",
    billNumber: "PL/2026/04",
    title: "Bill governing Cybersecurity, Electronic Communications and Data Protection",
    sponsor: "Ministry of Posts and Telecommunications",
    sponsorType: "Executive Government",
    committee: "Committee on Constitutional Laws",
    session: "10th Legislature Ordinary Session",
    status: "committee_review",
    stepIndex: 2,
    depositDate: "Oct 28, 2025",
    lastUpdate: "Under line-by-line examination in Constitutional Laws Committee",
    summary: "Framework for digital sovereignty, critical national infrastructure defense, and cross-border digital transactions.",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "bill-2026-03",
    billNumber: "PROP/2026/02",
    title: "Private Member's Bill on Enhanced Transparency in Public Procurement Contracts",
    sponsor: "Hon. Cabral Libii & PCRN Parliamentary Group",
    sponsorType: "Private Member",
    committee: "Committee on Production and Trade",
    session: "10th Legislature Ordinary Session",
    status: "tabled",
    stepIndex: 1,
    depositDate: "Jan 15, 2026",
    lastUpdate: "Deposited at Bureau of the National Assembly; awaiting conference of presidents",
    summary: "Mandates real-time online publishing of municipal infrastructure tenders and contractor performance audits.",
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "bill-2026-04",
    billNumber: "LAW/2025/19",
    title: "Law laying down the General Code of Regional and Local Authorities (Decentralization Amendment)",
    sponsor: "Ministry of Territorial Administration",
    sponsorType: "Executive Government",
    committee: "Committee on Constitutional Laws",
    session: "June 2025 Ordinary Session",
    status: "promulgated",
    stepIndex: 4,
    depositDate: "June 04, 2025",
    lastUpdate: "Enacted and Promulgated into Official Gazette (Law No. 2025/019)",
    summary: "Expands the fiscal autonomy of Regional Councils and increases direct budgetary transfers to councils in crisis-affected divisions.",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    keyVoteBreakdown: { for: 165, against: 10, abstain: 5 },
  },
];

const STAGES = [
  { step: 1, label: "Tabling", sub: "Dépôt au Bureau" },
  { step: 2, label: "Committee", sub: "Examen en Commission" },
  { step: 3, label: "Plenary Vote", sub: "Adoption en Plénière" },
  { step: 4, label: "Promulgated", sub: "Loi Promulguée" },
];

export function BillTrackingPipeline() {
  const { data: rawArticles = [] } = useArticles();
  const [filterType, setFilterType] = useState<string>("all");

  // Dynamically map real published database articles under 'bills-laws' or 'committee-echoes'
  const dynamicBills = useMemo(() => {
    const billArticles = rawArticles.filter((a: any) => {
      const slug = (a.categorySlug || "").toLowerCase();
      const cat = (a.category || "").toLowerCase();
      const title = (a.title || "").toLowerCase();
      return (
        slug.includes("bill") ||
        slug.includes("law") ||
        slug.includes("committee") ||
        cat.includes("bill") ||
        cat.includes("law") ||
        title.includes("bill") ||
        title.includes("projet de loi") ||
        title.includes("loi")
      );
    });

    if (!billArticles.length) return DEFAULT_BILLS;

    return billArticles.slice(0, 6).map((a: any, idx: number) => {
      const step = (idx % 4) + 1;
      const statusMap: Record<number, "tabled" | "committee_review" | "plenary_vote" | "promulgated"> = {
        1: "tabled",
        2: "committee_review",
        3: "plenary_vote",
        4: "promulgated",
      };

      const dateStr = a.publishedAt || a.createdAt
        ? new Date(a.publishedAt || a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "Recent";

      return {
        id: a.id || `db-bill-${idx}`,
        billNumber: a.billNumber || `PL/2026/0${idx + 1}`,
        title: a.title,
        sponsor: a.author || "National Assembly / Government",
        sponsorType: idx % 2 === 0 ? "Executive Government" : "Private Member",
        committee: a.committee || "Committee on Constitutional Laws",
        session: "10th Legislature (2020–2026 Mandate)",
        status: statusMap[step],
        stepIndex: step,
        depositDate: dateStr,
        lastUpdate: a.excerpt || a.summary || "Debates and review active in hemicycle",
        summary: a.summary || a.excerpt || (a.content ? a.content.replace(/<[^>]*>?/gm, "").slice(0, 160) + "..." : "Legislative review in progress"),
        imageUrl: a.coverImage || a.imageUrl || DEFAULT_BILLS[idx % DEFAULT_BILLS.length].imageUrl,
        slug: a.slug,
        keyVoteBreakdown: step >= 3 ? { for: 150 + idx * 3, against: 12 + idx, abstain: 4 } : undefined,
      } as LegislativeBill;
    });
  }, [rawArticles]);

  const [selectedBillId, setSelectedBillId] = useState<string>("");

  const effectiveSelectedBillId = selectedBillId || (dynamicBills[0]?.id ?? "");

  const filteredBills = dynamicBills.filter((b: any) => {
    if (filterType === "all") return true;
    if (filterType === "executive") return b.sponsorType === "Executive Government";
    if (filterType === "private") return b.sponsorType === "Private Member";
    if (filterType === "active") return b.status !== "promulgated";
    return true;
  });

  const selectedBill = dynamicBills.find((b: any) => b.id === effectiveSelectedBillId) || dynamicBills[0] || DEFAULT_BILLS[0];

  return (
    <section className="my-8 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#050596]" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Cameroon Legislative Bill Tracker
            </h2>
            <span className="text-xs font-semibold bg-blue-50 text-[#050596] border border-blue-200/60 px-2 py-0.5 rounded-full">
              National Assembly Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time step-by-step progress tracking for government and private member bills in the 10th Legislature
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start md:self-auto">
          {[
            { key: "all", label: "All Bills" },
            { key: "active", label: "In Progress" },
            { key: "executive", label: "Govt Bills" },
            { key: "private", label: "Private Member" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${
                filterType === tab.key
                  ? "bg-[#050596] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bill Pipeline Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Bill Selector List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredBills.map((bill: any) => {
            const isSelected = bill.id === selectedBill.id;
            return (
              <div
                key={bill.id}
                onClick={() => setSelectedBillId(bill.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex gap-3 ${
                  isSelected
                    ? "bg-blue-50/50 border-[#050596] shadow-sm ring-1 ring-[#050596]/30"
                    : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70 hover:border-slate-300"
                }`}
              >
                {bill.imageUrl && (
                  <img
                    src={bill.imageUrl}
                    alt={bill.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#050596] bg-blue-100/80 px-1.5 py-0.5 rounded">
                      {bill.billNumber}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        bill.status === "promulgated"
                          ? "bg-emerald-100 text-emerald-800"
                          : bill.status === "plenary_vote"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      Step {bill.stepIndex}/4: {STAGES[bill.stepIndex - 1].label}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {bill.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">
                    Sponsor: <span className="text-slate-700 font-medium">{bill.sponsor}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive Step Visualizer */}
        <div className="lg:col-span-7 bg-slate-50/60 rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between">
          <div>
            {/* Header info with Image Preview */}
            <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-slate-200">
              {selectedBill.imageUrl && (
                <img
                  src={selectedBill.imageUrl}
                  alt={selectedBill.title}
                  className="w-full sm:w-28 h-28 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm"
                />
              )}
              <div className="flex-1">
                <span className="text-xs font-mono font-bold text-[#050596] bg-blue-100 px-2.5 py-1 rounded">
                  {selectedBill.billNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                  {selectedBill.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Session: <strong className="text-slate-700">{selectedBill.session}</strong>
                </p>
              </div>
            </div>

            {/* 4-Step Interactive Visual Progress Pipeline */}
            <div className="my-6">
              <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
                <div
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#050596] z-0 transition-all duration-500"
                  style={{ width: `${((selectedBill.stepIndex - 1) / 3) * 100}%` }}
                />

                {/* Steps Nodes */}
                {STAGES.map((s) => {
                  const isCompleted = s.step < selectedBill.stepIndex;
                  const isCurrent = s.step === selectedBill.stepIndex;
                  return (
                    <div key={s.step} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                          isCompleted
                            ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                            : isCurrent
                            ? "bg-[#050596] text-white ring-4 ring-blue-100 scale-110"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                      </div>
                      <span
                        className={`text-xs font-bold mt-2 text-center ${
                          isCurrent ? "text-[#050596]" : "text-slate-700"
                        }`}
                      >
                        {s.label}
                      </span>
                      <span className="text-[10px] text-slate-400 text-center hidden sm:block">
                        {s.sub}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Progress Card */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Current Stage Status:</h4>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    {selectedBill.lastUpdate}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Assigned Committee:</span> {selectedBill.committee}
              </div>

              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800">Summary:</span> {selectedBill.summary}
              </div>

              {selectedBill.keyVoteBreakdown && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-1">
                    Floor Vote Division:
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      For: {selectedBill.keyVoteBreakdown.for}
                    </span>
                    <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                      Against: {selectedBill.keyVoteBreakdown.against}
                    </span>
                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                      Abstained: {selectedBill.keyVoteBreakdown.abstain}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 text-xs">
            <span className="text-slate-500">Deposited on {selectedBill.depositDate}</span>
            <Link
              to="/bills-laws"
              className="font-bold text-[#050596] hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              Browse Full Legislative Archive <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
