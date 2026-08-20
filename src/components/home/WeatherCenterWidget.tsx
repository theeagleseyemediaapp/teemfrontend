import { useState, useEffect } from "react";
import { useWeather } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Gauge,
  MapPin,
  RefreshCw,
  Play,
  Pause,
  ArrowRight,
  Compass,
  Radio,
  CheckCircle2,
} from "lucide-react";

export function WeatherCenterWidget({ compact = false }: { compact?: boolean }) {
  const { data: weatherData = [], isLoading, isError, refetch } = useWeather();
  const [activeCityIndex, setActiveCityIndex] = useState<number>(0);
  const [isAutoLooping, setIsAutoLooping] = useState<boolean>(true);
  const [unit, setUnit] = useState<"C" | "F">("C");

  // Automatic regional ticker loop effect (rotates through Cameroon's 10 regions every 6 seconds)
  useEffect(() => {
    if (!isAutoLooping || weatherData.length <= 1) return;
    const timer = setInterval(() => {
      setActiveCityIndex((prev) => (prev + 1) % weatherData.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoLooping, weatherData.length]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[240px] space-y-3">
        <RefreshCw className="size-7 text-[#050596] animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Loading Regional Meteorological Updates...
        </p>
      </div>
    );
  }

  if (isError || !weatherData.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center space-y-3">
        <p className="text-xs text-rose-600 font-bold">
          Meteorological updates updating.
        </p>
        <button
          onClick={() => refetch()}
          className="text-xs bg-[#050596] text-white font-black px-4 py-2 rounded-lg hover:bg-navy/90 transition-all cursor-pointer shadow-sm"
        >
          Refresh Live Stream
        </button>
      </div>
    );
  }

  const activeData = weatherData[activeCityIndex] || weatherData[0];
  const { city, tempC, tempF, feelsLikeC, humidity, windSpeedKmH, precipitationMm, surfacePressureHpa, condition, forecast, uvIndexMax } = activeData;

  const currentTemp = unit === "C" ? tempC : tempF;
  const feelsTemp = unit === "C" ? feelsLikeC : Math.round((feelsLikeC * 9) / 5 + 32);

  const renderWeatherIcon = (iconType: string, className = "size-8") => {
    switch (iconType) {
      case "sunny":
        return <Sun className={`${className} text-amber-500 animate-spin-slow`} />;
      case "cloudy":
      case "partly-cloudy":
        return <Cloud className={`${className} text-slate-400`} />;
      case "rain":
      case "drizzle":
        return <CloudRain className={`${className} text-blue-500`} />;
      case "thunderstorm":
        return <CloudLightning className={`${className} text-amber-600 animate-pulse`} />;
      case "fog":
        return <CloudFog className={`${className} text-slate-400`} />;
      default:
        return <Sun className={`${className} text-amber-500`} />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden relative font-sans text-slate-900 dark:text-slate-100">
      {/* Flag Accent Stripe Top */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-[#007A5E]" />
        <div className="h-full flex-1 bg-[#CE1126]" />
        <div className="h-full flex-1 bg-[#FCD116]" />
      </div>

      {/* Top Header Bar — Clean Editorial Style */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            <span className="size-2 rounded-full bg-white animate-ping" />
            <span>LIVE METEO</span>
          </div>
          <div>
            <h3 className="font-serif text-base font-black text-[#050596] dark:text-white uppercase tracking-wider">
              Météo Nationale — Regional Weather
            </h3>
          </div>
        </div>

        {/* Unit Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 flex text-xs font-bold">
            <button
              onClick={() => setUnit("C")}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                unit === "C" ? "bg-[#050596] text-white font-black" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit("F")}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                unit === "F" ? "bg-[#050596] text-white font-black" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              °F
            </button>
          </div>

          <Link
            to="/weather"
            className="text-xs font-bold text-[#050596] dark:text-amber-400 hover:underline uppercase tracking-wider flex items-center gap-1 bg-blue-50 dark:bg-amber-400/10 px-3 py-1 rounded-lg border border-blue-200 dark:border-amber-400/30 transition-all"
          >
            <span>Full Regional Forecast</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* 10 Regional Capitals Ticker Bar */}
      <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#050596] dark:text-amber-400 shrink-0 flex items-center gap-1">
          <Compass className="size-3.5" />
          <span>10 Regions:</span>
        </span>

        {weatherData.map((w: any, idx: number) => {
          const isSelected = idx === activeCityIndex;
          return (
            <button
              key={w.city.id}
              onClick={() => {
                setActiveCityIndex(idx);
                setIsAutoLooping(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-[#050596] text-white shadow-sm font-black ring-2 ring-amber-400"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {w.city.isCapital && <span className="size-1.5 rounded-full bg-red-600" title="Seat of Assembly / Government" />}
              <span>{w.city.name}</span>
              <span className="text-[10px] font-mono opacity-80">
                {unit === "C" ? `${w.tempC}°` : `${w.tempF}°`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Body */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Active Region Display */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#050596] dark:text-amber-400 uppercase tracking-wider">
              <MapPin className="size-4 text-red-600 animate-bounce-gentle" />
              <span>{city.name} — {city.region} ({city.role})</span>
            </div>

            <div className="flex items-baseline gap-5">
              <div className="flex items-center gap-4">
                {renderWeatherIcon(condition.icon, "size-14 sm:size-16")}
                <div>
                  <span className="font-serif text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
                    {currentTemp}°
                  </span>
                  <span className="text-xl font-bold text-amber-500 ml-1">°{unit}</span>
                </div>
              </div>

              <div className="border-l border-slate-200 dark:border-slate-800 pl-4 space-y-1">
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">{condition.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Feels like {feelsTemp}°{unit}</p>
                <div className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="size-3" />
                  <span>UV Index: {uvIndexMax} / 10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Broadcast Metrics Grid */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 grid grid-cols-2 gap-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Droplets className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Humidity</span>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{humidity}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Wind className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Wind Speed</span>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{windSpeedKmH} km/h</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <CloudRain className="size-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Precipitation</span>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{precipitationMm} mm</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Gauge className="size-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Pressure</span>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{surfacePressureHpa} hPa</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Day Outlook */}
        {!compact && forecast && forecast.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#050596] dark:text-amber-400 flex items-center gap-1.5">
                <Compass className="size-3.5" />
                <span>5-Day Forecast — {city.name} Sector</span>
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {forecast.map((day: any, idx: number) => {
                const maxT = unit === "C" ? day.tempMaxC : Math.round((day.tempMaxC * 9) / 5 + 32);
                const minT = unit === "C" ? day.tempMinC : Math.round((day.tempMinC * 9) / 5 + 32);

                return (
                  <div
                    key={idx}
                    className="bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-center transition-all space-y-1.5"
                  >
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 block uppercase tracking-wider">
                      {day.dayName}
                    </span>

                    <div className="flex justify-center py-1">
                      {renderWeatherIcon(day.condition.icon, "size-6")}
                    </div>

                    <div className="text-xs font-mono font-bold space-x-1">
                      <span className="text-slate-900 dark:text-white">{maxT}°</span>
                      <span className="text-slate-400 font-normal">/ {minT}°</span>
                    </div>

                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate" title={day.condition.label}>
                      {day.condition.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Ticker Strip — Clean Light Press Style */}
      <div className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 px-5 py-2.5 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 truncate">
          <Radio className="size-3.5 text-red-600 animate-pulse shrink-0" />
          <span className="font-mono text-[11px] truncate">
            PARLIAMENT PRESS METEO — Daily regional weather reports for National Assembly proceedings and 10 Cameroonian administrative regions.
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 shrink-0 hidden sm:inline">
          Refreshed: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
