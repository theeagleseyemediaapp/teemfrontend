import { useState, useEffect } from "react";
import { useWeather } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { Sun, Cloud, CloudRain, CloudLightning } from "lucide-react";

export function HeaderWeatherPill() {
  const { data: weatherData = [], isLoading } = useWeather();
  const [index, setIndex] = useState<number>(0);

  // Auto-rotate ticker for header menu every 5 seconds
  useEffect(() => {
    if (weatherData.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % weatherData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [weatherData.length]);

  if (isLoading || !weatherData.length) {
    return (
      <span className="text-[10px] text-amber-300 font-mono opacity-80 animate-pulse">
        Yaoundé 26°C ☀️
      </span>
    );
  }

  const active = weatherData[index] || weatherData[0];
  const cityName = active?.city?.name ?? "Yaoundé";
  const tempC = active?.tempC ?? 26;
  const iconType = active?.condition?.icon;

  const renderIcon = () => {
    switch (iconType) {
      case "sunny":
        return <Sun className="size-3 text-amber-400 animate-spin-slow" />;
      case "rain":
      case "drizzle":
        return <CloudRain className="size-3 text-blue-400" />;
      case "thunderstorm":
        return <CloudLightning className="size-3 text-amber-300" />;
      default:
        return <Cloud className="size-3 text-slate-300" />;
    }
  };

  return (
    <Link
      to="/weather"
      className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded transition-all cursor-pointer shadow-sm group"
      title="View Météo Nationale — Regional Weather Radar"
    >
      {renderIcon()}
      <span className="group-hover:text-amber-300 transition-colors">
        {cityName} {tempC}°C
      </span>
    </Link>
  );
}
