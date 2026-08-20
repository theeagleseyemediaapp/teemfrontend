import { createFileRoute } from "@tanstack/react-router";
import { WeatherCenterWidget } from "@/components/home/WeatherCenterWidget";
import { Radio, MapPin, Thermometer, Shield } from "lucide-react";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Cameroon Regional Weather Radar & Parliamentary Climate Outlook — The Eagle's Eye Media" },
      { name: "description", content: "Live meteorological radar and regional weather forecasts for Cameroon's seat of Parliament in Yaoundé, Douala, Bamenda, Garoua, Buea, Maroua, and all 10 regions." },
      { name: "keywords", content: "Cameroon weather radar, meteo Yaounde, meteo Douala, Cameroon climate outlook, parliamentary meteorological press" },
      { property: "og:title", content: "Cameroon Weather Center — The Eagle's Eye Media" },
      { property: "og:description", content: "Live weather radar scan, satellite updates, and 5-day regional climate forecasts across Cameroon." },
      { property: "og:url", content: "/weather" },
    ],
    links: [{ rel: "canonical", href: "/weather" }],
  }),
  component: WeatherPage,
});

function WeatherPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
      {/* Cameroon Flag Accent Stripe */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-[#007A5E]" />
        <div className="h-full flex-1 bg-[#CE1126]" />
        <div className="h-full flex-1 bg-[#FCD116]" />
      </div>

      {/* Header Banner — Classic Editorial Navy */}
      <section className="bg-[#050596] text-white py-8 px-4 sm:px-6 shadow-sm">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
              RÉPUBLIQUE DU CAMEROUN
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight">
              Météo Nationale — Regional Weather
            </h1>
            <p className="text-xs text-slate-200 max-w-3xl leading-relaxed">
              Meteorological monitoring across Cameroon's 10 regions and seat of Parliament in Yaoundé. Live forecasts for regional affairs, agriculture, transport, and parliamentary sitting schedules.
            </p>
          </div>

          {/* Metrics Badge */}
          <div className="bg-white/10 px-4 py-2.5 rounded-xl flex items-center gap-3 shrink-0 text-xs font-bold">
            <Radio className="size-4 text-amber-400 animate-pulse" />
            <span>10 Regions &amp; Yaoundé HQ</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-8">
        <WeatherCenterWidget />

        {/* Informational Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2 shadow-sm">
            <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#050596] dark:text-blue-400 flex items-center justify-center">
              <MapPin className="size-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">Yaoundé Seat of Government</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Monitors weather conditions around the National Assembly building at Ngoa-Ekellé and Senate chamber for plenary schedules.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2 shadow-sm">
            <div className="size-9 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Thermometer className="size-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">10 Regional Capitals</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Synchronized telemetry across Littoral, Grassfields, Adamawa, Sahelian, and Forest regional hubs.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2 shadow-sm">
            <div className="size-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield className="size-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Verified Telemetry</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Direct integration with live satellite API telemetry ensuring zero mock data and automatic updates.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
