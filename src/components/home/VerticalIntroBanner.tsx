import { useState, useEffect } from "react";

export function VerticalIntroBanner() {
  const [introIndex, setIntroIndex] = useState(0);

  const introSlides = [
    {
      tag: "Who We Are",
      title: "The Independent Watchdog of Cameroon's Parliament",
      desc: "The Eagle's Eye Media is a non-partisan, independent press and political news agency. We are dedicated to providing transparency, objective reports, and primary sources from Cameroon's National Assembly, Senate, and legislative committees."
    },
    {
      tag: "Our Journalism",
      title: "In-Depth Investigative Reporting & Analysis",
      desc: "Explore comprehensive news coverage, professional articles, bill tracking databases, and legal updates. We interview lawmakers, review national policy, and analyze parliamentary archives to keep citizens fully informed on state affairs."
    },
    {
      tag: "Civic Services",
      title: "Watch Plenary Debates Live & Stay Engaged",
      desc: "Stream live parliamentary plenaries, download digital copies of the premium legislative journals, get breaking notifications on key bills, and join civil discussion boards directly on our platform."
    }
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIntroIndex((current) => (current + 1) % introSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [introSlides.length]);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0D1530] to-[#0A1128] text-white p-6 sm:p-8 rounded-lg border border-white/10 shadow-2xl">
        {/* Diagonal grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('/breadcrumb_background.png')", backgroundSize: "cover" }} />
        {/* Orange ambient glow */}
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#E57C23] rounded-full blur-[80px] opacity-15" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div className="flex-1 min-h-[140px] md:min-h-[100px] relative overflow-hidden">
            {introSlides.map((slide, idx) => (
              <div 
                key={idx}
                className={`transition-all duration-700 absolute inset-0 flex flex-col justify-center ${
                  idx === introIndex 
                    ? "opacity-100 translate-y-0 relative pointer-events-auto" 
                    : "opacity-0 -translate-y-4 pointer-events-none"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-gold animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold">{slide.tag}</span>
                </div>
                <h2 className="font-serif font-black text-xl sm:text-2xl mt-1 text-white leading-tight">{slide.title}</h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">{slide.desc}</p>
              </div>
            ))}
          </div>

          {/* Right navigation / dots indicators */}
          <div className="flex md:flex-col items-center justify-center gap-2 self-start md:self-center">
            {introSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIntroIndex(idx)}
                className={`size-2.5 rounded-full transition-all duration-300 ${
                  idx === introIndex ? "bg-gold w-6" : "bg-white/30"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
