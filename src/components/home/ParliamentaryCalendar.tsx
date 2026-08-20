import { useState } from "react";
import { Calendar, Clock, MapPin, ChevronRight, AlertCircle, CheckCircle, Radio } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface AgendaEvent {
  id: string;
  time: string;
  chamber: "National Assembly" | "Joint Plenary" | "Standing Committee";
  title: string;
  location: string;
  status: "live" | "scheduled" | "concluded";
  committee?: string;
  imageUrl?: string;
  keySpeakers?: string[];
}

const UPCOMING_AGENDA: AgendaEvent[] = [
  {
    id: "evt-1",
    time: "10:00 AM - 01:30 PM",
    chamber: "National Assembly",
    title: "Plenary Sitting: General Debate on the 2026 Budget & Medium-Term Economic Framework",
    location: "Hemicycle, Ngoa-Ekellé, Yaoundé",
    status: "live",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
    keySpeakers: ["Rt. Hon. Cavaye Yéguié Djibril", "Minister of Finance", "Hon. Roger Melingui"],
  },
  {
    id: "evt-2",
    time: "03:00 PM - 06:00 PM",
    chamber: "Standing Committee",
    title: "Committee on Constitutional Laws: Clause-by-Clause Scrutiny of the Electoral Code",
    committee: "Constitutional Laws, Human Rights & Freedoms",
    location: "Committee Room A, Palais des Congrès",
    status: "scheduled",
    imageUrl: "https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&w=600&q=80",
    keySpeakers: ["Hon. Cabral Libii", "Committee Chair"],
  },
  {
    id: "evt-3",
    time: "Tomorrow at 09:30 AM",
    chamber: "National Assembly",
    title: "Oral Question Time to the Government: Ministers of Public Works & Energy",
    location: "Hemicycle, Yaoundé",
    status: "scheduled",
    imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80",
    keySpeakers: ["Minister of Public Works", "Hon. Nourane Foster", "Hon. Joshua Osih"],
  },
];

const ORDINARY_SESSIONS = [
  {
    month: "March Session",
    mandate: "Verification of Credentials & Election of Bureau",
    description: "Annual opening ordinary session. MPs adopt standing orders and elect the National Assembly Bureau.",
    active: false,
  },
  {
    month: "June Session",
    mandate: "Mid-Year Legislative Evaluation & General Laws",
    description: "Examines priority government legislation, international treaties, and policy questions.",
    active: false,
  },
  {
    month: "November Session",
    mandate: "Annual State Budget & Finance Law Session",
    description: "The primary budgetary session where the state budget and public investment allocations are voted.",
    active: true,
  },
];

export function ParliamentaryCalendar() {
  const [activeTab, setActiveTab] = useState<"agenda" | "sessions">("agenda");

  return (
    <section className="my-8 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#050596] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Order of Business & Session Calendar
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Session in Progress
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Daily agenda, plenary hearings, and the 3 ordinary session cycles of the National Assembly
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("agenda")}
            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${
              activeTab === "agenda"
                ? "bg-[#050596] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Today on the Floor ({UPCOMING_AGENDA.length})
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${
              activeTab === "sessions"
                ? "bg-[#050596] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Annual Session Cycles
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-5">
        {activeTab === "agenda" ? (
          <div className="space-y-3">
            {UPCOMING_AGENDA.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex gap-4 items-start flex-1">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
                    />
                  )}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.status === "live" ? (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
                          <Radio className="w-3 h-3 animate-pulse" /> Live Now
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          Scheduled
                        </span>
                      )}

                      <span className="text-xs font-semibold text-[#050596] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
                        {item.chamber}
                      </span>

                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {item.time}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                      </span>
                      {item.keySpeakers && (
                        <span>
                          Key Figures: <strong className="text-slate-700">{item.keySpeakers.join(", ")}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {item.status === "live" && (
                  <Link
                    to="/watch-live"
                    className="shrink-0 inline-flex items-center gap-1.5 bg-[#050596] hover:bg-blue-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
                  >
                    Watch Live Stream →
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ORDINARY_SESSIONS.map((sess, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl border flex flex-col justify-between ${
                  sess.active
                    ? "bg-blue-50/50 border-[#050596] ring-1 ring-[#050596]/20"
                    : "bg-slate-50/60 border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-[#050596] uppercase tracking-wider">
                      Session {i + 1}
                    </span>
                    {sess.active && (
                      <span className="text-[10px] font-bold bg-[#050596] text-white px-2 py-0.5 rounded-full">
                        Current Session
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{sess.month}</h3>
                  <h4 className="text-xs font-semibold text-amber-700 mt-0.5">{sess.mandate}</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{sess.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] font-medium text-slate-500">
                  Article 15, Constitution of Cameroon
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
