import { useState } from "react";
import { Users, FileSpreadsheet, Shield, Globe, Scale, BookOpen, Factory, ScrollText, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface CommitteeInfo {
  id: string;
  number: number;
  name: string;
  frenchName: string;
  iconName: string;
  chairperson?: string;
  chairParty?: string;
  memberCount: number;
  mandate: string;
  imageUrl?: string;
  currentInquiries?: string[];
}

const STANDING_COMMITTEES: CommitteeInfo[] = [
  {
    id: "comm-1",
    number: 1,
    name: "Constitutional Laws, Human Rights, Freedoms & General Administration",
    frenchName: "Lois Constitutionnelles, Droits de l'Homme et Libertés",
    iconName: "scale",
    chairperson: "Hon. Zondol Hermine",
    chairParty: "CPDM/RDPC",
    memberCount: 20,
    mandate: "Examines constitutional reforms, electoral laws, judicial statutes, decentralization bills, and civil rights protection.",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    currentInquiries: ["Electoral Code Review", "Decentralization Powers Implementation"],
  },
  {
    id: "comm-2",
    number: 2,
    name: "Finance and Budget",
    frenchName: "Finances et Budget",
    iconName: "spreadsheet",
    chairperson: "Hon. Rosette Moutymbo",
    chairParty: "CPDM/RDPC",
    memberCount: 20,
    mandate: "Direct line-by-line scrutiny of the annual State Finance Law, customs tariffs, taxation codes, and national debt obligations.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    currentInquiries: ["2026 Fiscal Revenue Projections", "Special Regional Infrastructure Funds"],
  },
  {
    id: "comm-3",
    number: 3,
    name: "Foreign Affairs",
    frenchName: "Affaires Étrangères",
    iconName: "globe",
    chairperson: "Hon. Ndongo Jean-Bernard",
    chairParty: "CPDM/RDPC",
    memberCount: 20,
    mandate: "Reviews international treaties, bilateral agreements, CEMAC integration protocols, and diplomatic missions.",
    imageUrl: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=600&q=80",
    currentInquiries: ["African Continental Free Trade Area (AfCFTA) Alignment"],
  },
  {
    id: "comm-4",
    number: 4,
    name: "National Defense and Security",
    frenchName: "Défense Nationale et Sécurité",
    iconName: "shield",
    chairperson: "Hon. Ali Bachir",
    chairParty: "CPDM/RDPC",
    memberCount: 20,
    mandate: "Oversees armed forces readiness, border security, gendarmerie modernizations, and defense procurement budgets.",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    currentInquiries: ["Far North & Border Security Evaluation"],
  },
  {
    id: "comm-5",
    number: 5,
    name: "Education, Vocational Training and Youth",
    frenchName: "Éducation, Formation Professionnelle et Jeunesse",
    iconName: "book",
    chairperson: "Hon. Agho Oliver Bapmock",
    chairParty: "CPDM/RDPC",
    memberCount: 20,
    mandate: "Focuses on basic, secondary, and higher education reforms, digital technical training, and youth employment policy.",
    currentInquiries: ["Teacher Recruitment Quotas & University Decentralization"],
  },
  {
    id: "comm-6",
    number: 6,
    name: "Production, Trade and Natural Resources",
    frenchName: "Production et Échanges",
    iconName: "factory",
    chairperson: "Hon. Kamssouloum Abba Kabir",
    chairParty: "CPDM/RDPC",
    memberCount: 20,
    mandate: "Agriculture, livestock, mining exploration, energy projects, industrial transformation, and consumer price regulations.",
    currentInquiries: ["National Electricity Grid Modernization", "Cocoa & Coffee Farmer Subsidies"],
  },
  {
    id: "comm-7",
    number: 7,
    name: "Cultural, Social and Family Affairs",
    frenchName: "Affaires Culturelles, Sociales et Familiales",
    iconName: "users",
    chairperson: "Hon. Gladys Etombi",
    chairParty: "CPDM/RDPC",
    memberCount: 20,
    mandate: "Public healthcare access, social security coverage, gender equality initiatives, and heritage preservation.",
    currentInquiries: ["Universal Health Coverage (CMU) Rollout Oversight"],
  },
  {
    id: "comm-8",
    number: 8,
    name: "Resolutions and Petitions",
    frenchName: "Résolutions et Pétitions",
    iconName: "scroll",
    chairperson: "Hon. Koupit Adamou",
    chairParty: "UDC",
    memberCount: 20,
    mandate: "Receives, screens, and investigates citizen petitions addressed to Parliament regarding administrative grievances.",
    currentInquiries: ["Citizen Land Dispute Petitions"],
  },
  {
    id: "comm-9",
    number: 9,
    name: "Internal Rules, Standing Orders & Immunities",
    frenchName: "Règlement Intérieur et Immunités",
    iconName: "scale",
    chairperson: "Hon. Roger Melingui",
    chairParty: "CPDM/RDPC",
    memberCount: 20,
    mandate: "Enforces parliamentary privileges, ethical standards, discipline in the hemicycle, and parliamentary immunity issues.",
    currentInquiries: ["Parliamentary Standing Orders Modernization"],
  },
];

export function StandingCommitteesHub() {
  const [selectedCommId, setSelectedCommId] = useState<string>(STANDING_COMMITTEES[0].id);

  const selectedComm =
    STANDING_COMMITTEES.find((c) => c.id === selectedCommId) || STANDING_COMMITTEES[0];

  return (
    <section className="my-8 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              The 9 Standing Parliamentary Committees
            </h2>
            <span className="text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
              Commissions Permanentes
            </span>
          </div>
          <p className="text-xs text-slate-500">
            The core working bodies of the National Assembly where bills are scrutinized, inquiries held, and ministers questioned
          </p>
        </div>

        <Link
          to="/committee-echoes"
          className="text-xs font-bold text-[#050596] hover:text-amber-600 flex items-center gap-1 transition-colors self-start md:self-auto"
        >
          View Committee Reports →
        </Link>
      </div>

      {/* Grid: Selector Tabs + Committee Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: 9 Committees List */}
        <div className="lg:col-span-5 space-y-2 max-h-[440px] overflow-y-auto pr-1">
          {STANDING_COMMITTEES.map((comm) => {
            const isSelected = comm.id === selectedComm.id;
            return (
              <button
                key={comm.id}
                onClick={() => setSelectedCommId(comm.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-blue-50/60 border-[#050596] ring-1 ring-[#050596]/30 shadow-sm"
                    : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? "bg-[#050596] text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {comm.number}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
                      {comm.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 line-clamp-1 italic">
                      {comm.frenchName}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {comm.memberCount} MPs
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Committee Card */}
        <div className="lg:col-span-7 bg-slate-50/70 rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header info with Image Preview */}
            <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-slate-200">
              {selectedComm.imageUrl && (
                <img
                  src={selectedComm.imageUrl}
                  alt={selectedComm.name}
                  className="w-full sm:w-28 h-28 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold bg-[#050596] text-white px-2.5 py-0.5 rounded">
                    Commission {selectedComm.number}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                    20 Siting MPs
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedComm.name}
                </h3>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  {selectedComm.frenchName}
                </p>
              </div>
            </div>

            {/* Leadership & Mandate */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3 text-xs">
              {selectedComm.chairperson && (
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="font-bold text-slate-700">Commission President:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#050596]">{selectedComm.chairperson}</span>
                    {selectedComm.chairParty && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {selectedComm.chairParty}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-800 block mb-1">Legislative Mandate:</span>
                <p className="text-slate-600 leading-relaxed">{selectedComm.mandate}</p>
              </div>

              {selectedComm.currentInquiries && (
                <div className="pt-2.5 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1.5">
                    Current Active Inquiries & Reports:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedComm.currentInquiries.map((inq, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold bg-blue-50 text-[#050596] border border-blue-200/60 px-2.5 py-1 rounded-md"
                      >
                        • {inq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 text-xs">
            <span className="text-slate-500">Standing Orders of the National Assembly</span>
            <Link
              to="/committee-echoes"
              className="font-bold text-[#050596] hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              Read Latest Committee Dispatches <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
