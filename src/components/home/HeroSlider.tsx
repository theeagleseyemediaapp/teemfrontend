import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSliderProps {
  slides: any[];
  activeIndex: number;
  onChangeIndex: (index: number | ((curr: number) => number)) => void;
}

export function HeroSlider({ slides, activeIndex, onChangeIndex }: HeroSliderProps) {
  const activeSlide = slides[activeIndex];
  if (!activeSlide) return null;

  return (
    <div className="relative overflow-hidden group rounded-lg shadow-lg bg-slate-950 border-0">
      <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[580px] overflow-hidden flex flex-col">
        <div key={activeSlide.id || activeSlide.slug || activeIndex} className="animate-slide-up-fade w-full h-full relative">
          <Link to="/article/$slug" params={{ slug: activeSlide.slug }} className="block w-full h-full relative">
            <img 
              src={activeSlide.coverImage || activeSlide.imageUrl || activeSlide.image || "/logo.png"} 
              alt={activeSlide.title} 
              loading="eager" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo.png"; }} 
            />
            {/* Blue gradient overlay for title contrast */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050596] via-[#050596]/80 to-transparent pt-16 pb-6 px-5 sm:px-8 z-10">
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-black leading-snug text-white group-hover:text-amber-400 transition-colors line-clamp-2 max-w-4xl">
                {activeSlide.title}
              </h1>
              {activeSlide.summary && (
                <p className="mt-2 text-xs sm:text-sm text-white/80 line-clamp-2 max-w-3xl">
                  {activeSlide.summary}
                </p>
              )}
              <div className="mt-4 text-[11px] text-white/60 font-bold tracking-widest uppercase flex items-center gap-2">
                <span>{activeSlide.author || "Editorial Desk"}</span>
                <span>&bull;</span>
                <span>{activeSlide.publishedAt ? new Date(activeSlide.publishedAt).toLocaleDateString() : activeSlide.timeAgo}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Indicator dots or status can remain if needed, but navigation buttons are removed as requested */}
      </div>
    </div>
  );
}
