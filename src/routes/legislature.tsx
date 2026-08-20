import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { mpApi as api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  MapPin,
  Vote,
  Loader2,
  X,
  SlidersHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/legislature")({
  head: () => ({
    meta: [
      { title: "National Assembly MPs — The Eagle's Eye Media" },
      {
        name: "description",
        content: "Members of Parliament directory of Cameroon's National Assembly.",
      },
      { property: "og:title", content: "National Assembly MPs — The Eagle's Eye Media" },
      {
        property: "og:description",
        content: "Official directory of Cameroon's Members of Parliament.",
      },
      { property: "og:url", content: "/legislature" },
    ],
    links: [{ rel: "canonical", href: "/legislature" }],
  }),
  component: CurrentLegislaturePage,
});

export default function CurrentLegislaturePage() {
  const [lang, setLang] = useState<"en" | "fr">(() =>
    typeof window !== "undefined" && localStorage.getItem("eem_language") === "fr" ? "fr" : "en"
  );
  const [selectedParty, setSelectedParty] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const handleLang = (e: any) => setLang(e.detail === "fr" ? "fr" : "en");
    window.addEventListener("eem-language-changed", handleLang);
    return () => window.removeEventListener("eem-language-changed", handleLang);
  }, []);

  // Fetch dynamic MPs list from API (National Assembly chamber)
  const { data: rawMps = [], isLoading: isMpsLoading } = useQuery({
    queryKey: ["mps-national-assembly", selectedParty, selectedRegion, selectedGender],
    queryFn: () =>
      api.getMps({
        partyId: selectedParty !== "all" ? selectedParty : undefined,
        regionId: selectedRegion !== "all" ? selectedRegion : undefined,
        gender: selectedGender !== "all" ? selectedGender : undefined,
        chamber: "national_assembly",
      }),
  });

  // Fetch dynamic regions
  const { data: regions = [] } = useQuery({
    queryKey: ["parliament-regions"],
    queryFn: () => api.getParliamentRegions(),
  });

  // Fetch dynamic political parties
  const { data: parties = [] } = useQuery({
    queryKey: ["political-parties"],
    queryFn: () => api.getPoliticalParties(),
  });

  // Filter MPs based on search query
  const mpsList = useMemo(() => {
    return rawMps.filter((mp: any) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = mp.fullName?.toLowerCase().includes(q);
      const constMatch = mp.constituency?.toLowerCase().includes(q);
      const partyMatch =
        mp.partyAcronym?.toLowerCase().includes(q) || mp.partyName?.toLowerCase().includes(q);
      const regMatch = mp.regionName?.toLowerCase().includes(q);
      const roleMatch = mp.role?.toLowerCase().includes(q);
      return nameMatch || constMatch || partyMatch || regMatch || roleMatch;
    });
  }, [rawMps, searchQuery]);

  // Group MPs by Region
  const groupedByRegion = useMemo(() => {
    return mpsList.reduce((acc: Record<string, any[]>, mp: any) => {
      const reg = mp.regionName || (lang === "fr" ? "National / Non assigné" : "National / Unassigned");
      if (!acc[reg]) acc[reg] = [];
      acc[reg].push(mp);
      return acc;
    }, {});
  }, [mpsList, lang]);

  const regionKeys = useMemo(() => Object.keys(groupedByRegion).sort(), [groupedByRegion]);

  const maleCount = rawMps.filter(
    (m: any) => !m.gender || m.gender.toLowerCase() === "male" || m.gender === "m"
  ).length;
  const femaleCount = rawMps.filter(
    (m: any) => m.gender && (m.gender.toLowerCase() === "female" || m.gender === "f")
  ).length;

  const hasActiveFilters =
    selectedRegion !== "all" ||
    selectedParty !== "all" ||
    selectedGender !== "all" ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedRegion("all");
    setSelectedParty("all");
    setSelectedGender("all");
    setSearchQuery("");
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
      {/* Cameroon Flag Accent Stripe */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-[#007A5E]" />
        <div className="h-full flex-1 bg-[#CE1126]" />
        <div className="h-full flex-1 bg-[#FCD116]" />
      </div>

      {/* Header */}
      <section className="bg-[#050596] text-white py-8 px-4 sm:px-6 shadow-sm">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
              {lang === "fr" ? "RÉPUBLIQUE DU CAMEROUN" : "REPUBLIC OF CAMEROON"}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-white">
              {lang === "fr"
                ? "Assemblée Nationale — Députés de la Nation"
                : "National Assembly — Members of Parliament"}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {lang === "fr"
                ? "Répertoire officiel des 180 Députés siégeant à l'Assemblée Nationale du Cameroun."
                : "Official directory of the 180 Members of Parliament of Cameroon's National Assembly."}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2">
              <Users className="size-4 text-amber-400" />
              <span>{lang === "fr" ? "Parité :" : "Parity:"}</span>
              <span className="text-blue-300 font-black">M: {maleCount}</span>
              <span className="text-pink-300 font-black">F: {femaleCount}</span>
            </div>
            <div className="bg-white/10 px-3.5 py-2 rounded-xl text-xs font-black text-amber-300">
              {rawMps.length} {lang === "fr" ? "Députés répertoriés" : "MPs Listed"}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6">
        {/* Dropdown Filter Bar */}
        <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#050596] dark:text-blue-400">
              <SlidersHorizontal className="size-4" />
              <span>{lang === "fr" ? "Filtres de recherche" : "Filter Directory"}</span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <X className="size-3.5" />
                <span>{lang === "fr" ? "Réinitialiser les filtres" : "Reset Filters"}</span>
              </button>
            )}
          </div>

          {/* Grid of Search + Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="size-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder={
                  lang === "fr"
                    ? "Rechercher par nom..."
                    : "Search MP name or const..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Region Dropdown */}
            <div className="w-full">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="size-3.5 text-emerald-600 shrink-0" />
                    <SelectValue
                      placeholder={lang === "fr" ? "Toutes les Régions" : "All Regions"}
                    />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="all" className="text-xs font-semibold">
                    {lang === "fr" ? "Toutes les Régions (10)" : "All Regions (10)"}
                  </SelectItem>
                  {regions.map((r: any) => (
                    <SelectItem key={r.id} value={r.id} className="text-xs">
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Political Party Dropdown */}
            <div className="w-full">
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger className="h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-center gap-2 truncate">
                    <Vote className="size-3.5 text-[#050596] shrink-0" />
                    <SelectValue
                      placeholder={lang === "fr" ? "Tous les Partis" : "All Political Parties"}
                    />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="all" className="text-xs font-semibold">
                    {lang === "fr" ? "Tous les Partis Politiques" : "All Political Parties"}
                  </SelectItem>
                  {parties.map((p: any) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.acronym ? `${p.acronym} — ` : ""}{p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender Parity Dropdown */}
            <div className="w-full">
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-center gap-2 truncate">
                    <Users className="size-3.5 text-amber-500 shrink-0" />
                    <SelectValue
                      placeholder={lang === "fr" ? "Genre : Tous" : "Gender: All"}
                    />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="all" className="text-xs font-semibold">
                    {lang === "fr" ? "Genre : Tous" : "Gender: All"}
                  </SelectItem>
                  <SelectItem value="male" className="text-xs">
                    {lang === "fr" ? "Hommes (Députés)" : "Men (MPs)"}
                  </SelectItem>
                  <SelectItem value="female" className="text-xs">
                    {lang === "fr" ? "Femmes (Députées)" : "Women (MPs)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* MPs Directory */}
        <section className="space-y-8">
          {isMpsLoading ? (
            <div className="py-20 text-center text-slate-500 font-semibold flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="size-8 animate-spin text-[#050596]" />
              <span className="text-sm">
                {lang === "fr" ? "Chargement des députés..." : "Loading Members of Parliament..."}
              </span>
            </div>
          ) : mpsList.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="font-bold text-base text-[#050596] dark:text-white">
                {lang === "fr" ? "Aucun député trouvé" : "No MPs found"}
              </p>
              <p className="text-xs text-slate-400">
                {lang === "fr"
                  ? "Essayez de modifier votre recherche ou vos sélections dans les menus déroulants."
                  : "Try adjusting your search query or dropdown selections."}
              </p>
            </div>
          ) : (
            regionKeys.map((regionName) => {
              const members = groupedByRegion[regionName];
              return (
                <div key={regionName} className="space-y-4">
                  {/* Region Header */}
                  <div className="flex items-center justify-between border-b-2 border-amber-400 pb-2">
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif font-black text-xl text-[#050596] dark:text-white">
                        {regionName}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 text-xs font-black">
                        {members.length} {lang === "fr" ? "Députés" : "MPs"}
                      </span>
                    </div>
                  </div>

                  {/* Responsive Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {members.map((mp: any) => {
                      const initials = mp.fullName
                        ? mp.fullName
                          .replace("Rt. Hon.", "")
                          .replace("Hon.", "")
                          .trim()
                          .split(" ")
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                        : "MP";

                      return (
                        <Card
                          key={mp.id}
                          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col justify-between rounded-2xl"
                        >
                          <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center space-y-2 relative">
                            {/* MP Tag */}
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              {lang === "fr" ? "Député" : "NA MP"}
                            </span>

                            {/* Photo / Avatar */}
                            {mp.photoUrl ? (
                              <img
                                src={mp.photoUrl}
                                alt={mp.fullName}
                                className="w-full aspect-[4/5] rounded-xl object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-[1.02] transition-transform shadow-xs"
                              />
                            ) : (
                              <div className="w-full aspect-[4/5] rounded-xl bg-gradient-to-br from-[#050596] via-slate-900 to-[#050596] border-2 border-amber-400/60 flex flex-col items-center justify-center text-amber-400 font-serif font-black text-2xl shadow-md space-y-1">
                                <span>{initials}</span>
                              </div>
                            )}

                            {/* Info */}
                            <div className="w-full">
                              <h3 className="font-serif font-black text-xs sm:text-base text-[#050596] dark:text-white leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                                {mp.fullName}
                              </h3>

                              {mp.role && (
                                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[9px] sm:text-[10px] font-black">
                                  <span className="line-clamp-1">{mp.role}</span>
                                </div>
                              )}

                              <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 line-clamp-1">
                                {mp.constituency
                                  ? `${lang === "fr" ? "Circonscription :" : "Const.:"} ${mp.constituency}`
                                  : lang === "fr"
                                    ? "Représentant National"
                                    : "National Rep."}
                              </div>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap items-center justify-center gap-1 pt-1 w-full border-t border-slate-100 dark:border-slate-800">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#050596] text-white text-[10px] font-black shadow-xs">
                                {mp.partyAcronym || "IND"}
                              </span>

                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                {mp.regionName || "Cameroon"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
