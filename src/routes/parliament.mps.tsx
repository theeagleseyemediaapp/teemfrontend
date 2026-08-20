import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { mpApi as api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  MapPin,
  Flag,
  PieChart as PieChartIcon,
  BarChart3,
  Filter,
  User,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/parliament/mps")({
  head: () => ({
    meta: [
      { title: "Members of Parliament (MPs) & Political Parties Directory — Cameroon" },
      { name: "description", content: "Explore the comprehensive public directory of Cameroon's 180 Members of the National Assembly and 100 Senators. Filter lawmakers by political party, chamber, region, and committee assignments." },
      { name: "keywords", content: "Cameroon MPs, Cameroon parliamentarians, list of MPs Cameroon, Cameroon Senators directory, RDPC SDF PCRN UNDP UDC deputies, National Assembly Yaoundé lawmakers" },
      { property: "og:title", content: "MPs & Political Parties Directory — Cameroon Parliament" },
      { property: "og:description", content: "Directory of Cameroon's National Assembly deputies and Senators. Search by party, chamber, region, and gender representation." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/parliament/mps" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "Cameroon Members of Parliament Directory" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MPs & Political Parties Directory — Cameroon Parliament" },
      { name: "twitter:description", content: "Explore lawmaker profiles, political parties, and demographic representation in Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/parliament/mps" }],
  }),
  component: ParliamentMpsPage,
});

const GENDER_COLORS = ["#050596", "#F5A623"];
const PARTY_COLORS = ["#050596", "#F5A623", "#10B981", "#6366F1", "#EC4899", "#8B5CF6"];

function ParliamentMpsPage() {
  const [lang, setLang] = useState<"en" | "fr">(() => (typeof window !== "undefined" && localStorage.getItem("eem_language") === "fr" ? "fr" : "en"));
  const [selectedChamber, setSelectedChamber] = useState<string>("");
  const [selectedParty, setSelectedParty] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const handleLang = (e: any) => setLang(e.detail === "fr" ? "fr" : "en");
    window.addEventListener("eem-language-changed", handleLang);
    return () => window.removeEventListener("eem-language-changed", handleLang);
  }, []);

  const analyticsQuery = useQuery({
    queryKey: ["mp-analytics"],
    queryFn: () => api.getMpAnalytics(),
  });

  const partiesQuery = useQuery({
    queryKey: ["political-parties"],
    queryFn: () => api.getPoliticalParties(),
  });

  const regionsQuery = useQuery({
    queryKey: ["parliament-regions"],
    queryFn: () => api.getParliamentRegions(),
  });

  const mpsQuery = useQuery({
    queryKey: ["mps", selectedParty, selectedRegion, selectedGender, selectedChamber],
    queryFn: () =>
      api.getMps({
        partyId: selectedParty || undefined,
        regionId: selectedRegion || undefined,
        gender: selectedGender || undefined,
        chamber: selectedChamber || undefined,
      }),
  });

  const analytics = analyticsQuery.data;
  const mpsList = (mpsQuery.data ?? []).filter((mp: any) =>
    mp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (mp.constituency && mp.constituency.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const genderChartData = [
    { name: "Male MPs", value: analytics?.byGender?.male || 0 },
    { name: "Female MPs", value: analytics?.byGender?.female || 0 },
  ];

  const partyChartData = (analytics?.byParty || []).map((p: any) => ({
    name: p.partyAcronym,
    count: p.count,
  }));

  const regionChartData = (analytics?.byRegion || []).map((r: any) => ({
    name: r.regionCode,
    fullName: r.regionName,
    count: r.count,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Users className="size-4" /> {lang === "fr" ? "Assemblée Nationale du Cameroun" : "Cameroon National Assembly"}
              </div>
              <h1 className="font-serif font-black text-3xl sm:text-4xl tracking-tight">
                {lang === "fr" ? "Annuaire des Députés à l'Assemblée Nationale" : "Members of Parliament (MPs) Directory"}
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                {lang === "fr"
                  ? "Explorez la répartition des députés par parti politique, les 10 régions du Cameroun et les statistiques par genre."
                  : "Explore the distribution of Members of Parliament across political parties, Cameroon's 10 Regions, and gender statistics."}
              </p>
            </div>

            {/* Total MPs Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-[160px] self-stretch md:self-auto flex flex-col justify-center">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                {lang === "fr" ? "Total Députés" : "Total MPs"}
              </div>
              <div className="text-4xl font-black text-white mt-1">
                {analyticsQuery.isLoading ? "…" : analytics?.totalMps ?? (mpsQuery.data ?? []).length}
              </div>
              <div className="text-[10px] text-slate-300 font-semibold mt-0.5">
                {lang === "fr" ? "180 Sièges Parlementaires (Assemblée & Sénat)" : "180 Parliamentary Seats (National Assembly & Senate)"}
              </div>
            </div>
          </div>
        </div>

        {/* Graphical Analytics Dashboard Section */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-navy dark:text-white flex items-center gap-2">
            <BarChart3 className="size-5 text-amber-500" />
            {lang === "fr" ? "Statistiques Parlementaires Graphiques" : "Graphical Parliamentary Analytics"}
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Chart 1: MPs per Political Party */}
            <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-navy dark:border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-navy dark:text-white flex items-center gap-1.5">
                  <Flag className="size-4 text-amber-500" />
                  {lang === "fr" ? "Députés par Parti Politique" : "MPs per Political Party"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {lang === "fr" ? "Répartition des sièges par sigle de parti" : "Seat distribution by party acronym"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-60 pt-2">
                {analyticsQuery.isLoading ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={partyChartData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} allowDecimals={false} />
                      <Tooltip formatter={(value) => [`${value} MPs`, "Seats"]} />
                      <Bar dataKey="count" fill="#050596" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Chart 2: MPs per Gender */}
            <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-navy dark:text-white flex items-center gap-1.5">
                  <User className="size-4 text-amber-500" />
                  {lang === "fr" ? "Députés par Genre" : "MPs per Gender"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {lang === "fr" ? "Ratio de représentation Hommes vs Femmes" : "Male vs. Female representation ratio"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-60 pt-2">
                {analyticsQuery.isLoading ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {genderChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => [`${val} MPs`, "Count"]} />
                      <Legend fontSize={12} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Chart 3: MPs per Region */}
            <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-navy dark:text-white flex items-center gap-1.5">
                  <MapPin className="size-4 text-emerald-500" />
                  {lang === "fr" ? "Députés par Région (10 Régions)" : "MPs per 10 Regions"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {lang === "fr" ? "Attribution régionale des sièges" : "Regional parliamentary allocation"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-60 pt-2">
                {analyticsQuery.isLoading ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionChartData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={10} />
                      <YAxis stroke="#888888" fontSize={11} allowDecimals={false} />
                      <Tooltip formatter={(value, name, props) => [`${value} MPs`, props.payload.fullName]} />
                      <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 10 Regions of Cameroon Map Visual Grid */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-navy dark:text-white flex items-center gap-2">
            <MapPin className="size-5 text-amber-500" />
            {lang === "fr" ? "Cartes de Représentation des 10 Régions du Cameroun" : "Cameroon 10 Regions Representation Maps"}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {(regionsQuery.data ?? []).map((region: any) => {
              const isSelected = selectedRegion === region.id;
              return (
                <div
                  key={region.id}
                  onClick={() => setSelectedRegion(isSelected ? "" : region.id)}
                  className={`cursor-pointer group relative h-36 rounded-2xl overflow-hidden shadow-md transition-all border-2 ${isSelected ? "border-amber-400 ring-4 ring-amber-400/20" : "border-slate-200 dark:border-slate-800 hover:border-amber-400"
                    }`}
                >
                  {region.mapImageUrl ? (
                    <img
                      src={region.mapImageUrl}
                      alt={region.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-navy via-slate-900 to-slate-950 flex flex-col justify-between p-3 relative">
                      <div className="text-[38px] font-black text-white/10 absolute right-2 top-1 select-none">
                        {region.code}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent p-3 flex flex-col justify-between">
                    <span className="self-end px-2 py-0.5 bg-amber-400 text-navy font-black text-[10px] rounded uppercase tracking-wider shadow">
                      {region.code}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight drop-shadow">{region.name}</h3>
                      <span className="text-[11px] font-extrabold text-amber-300">{region.mpCount || 0} MPs</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filterable MPs Directory */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-black text-2xl text-navy dark:text-white flex items-center gap-2">
                <Users className="size-6 text-amber-500" />
                {lang === "fr" ? "Annuaire des Parlementaires du Cameroun" : "Cameroon Parliament Members Directory"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === "fr"
                  ? "Recherchez parmi les 180 sièges de l'Assemblée Nationale et du Sénat"
                  : "Search through 180 seats across the National Assembly (Lower House) & Senate (Upper House)"}
              </p>
            </div>

            {/* Chamber Selection Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setSelectedChamber("")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${selectedChamber === ""
                    ? "bg-navy text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-navy"
                  }`}
              >
                {lang === "fr" ? "Tout le Parlement" : "All Parliament"}
              </button>
              <button
                onClick={() => setSelectedChamber("national_assembly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${selectedChamber === "national_assembly"
                    ? "bg-navy text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-navy"
                  }`}
              >
                🏛️ {lang === "fr" ? "Assemblée Nationale (180)" : "National Assembly (180)"}
              </button>
              <button
                onClick={() => setSelectedChamber("senate")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${selectedChamber === "senate"
                    ? "bg-navy text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-navy"
                  }`}
              >
                👑 {lang === "fr" ? "Sénat (100)" : "Senate (100)"}
              </button>
            </div>
          </div>

          {/* Filter controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border-0 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="size-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder={lang === "fr" ? "Rechercher par nom, circonscription ou rôle..." : "Search by name, constituency, or role..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs border-0 bg-slate-100 dark:bg-slate-800"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="rounded-lg border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="">{lang === "fr" ? "Tous les Partis Politiques" : "All Political Parties"}</option>
                {(partiesQuery.data ?? []).map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.acronym} - {p.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="rounded-lg border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="">{lang === "fr" ? "Toutes les 10 Régions" : "All 10 Regions"}</option>
                {(regionsQuery.data ?? []).map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>

              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="rounded-lg border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="">{lang === "fr" ? "Tous les Genres" : "All Genders"}</option>
                <option value="male">{lang === "fr" ? "Hommes" : "Male"}</option>
                <option value="female">{lang === "fr" ? "Femmes" : "Female"}</option>
              </select>
            </div>
          </div>

          {/* MPs Cards Grid */}
          {mpsQuery.isLoading ? (
            <div className="py-16 text-center text-slate-500 font-semibold">
              {lang === "fr" ? "Chargement de l'annuaire des députés et sénateurs..." : "Loading parliamentarians directory..."}
            </div>
          ) : mpsList.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl shadow-sm space-y-2 border-0">
              <p className="font-bold text-base text-navy dark:text-white">
                {lang === "fr" ? "Aucun parlementaire trouvé" : "No parliamentarians found"}
              </p>
              <p className="text-xs text-slate-400">
                {lang === "fr" ? "Essayez de modifier vos filtres de recherche." : "Try adjusting your party, region, or search query filters."}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {mpsList.map((mp: any) => (
                <Card
                  key={mp.id}
                  className="bg-white dark:bg-slate-900 border-0 shadow-md hover:shadow-2xl transition-all duration-300 group overflow-hidden flex flex-col justify-between rounded-2xl"
                >
                  <CardContent className="p-5 flex flex-col items-center text-center space-y-3 relative">
                    {/* Chamber badge */}
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${mp.chamber === "senate"
                        ? "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300"
                        : "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300"
                      }`}>
                      {mp.chamber === "senate" ? (lang === "fr" ? "Sénateur" : "Senator") : (lang === "fr" ? "Député AN" : "NA MP")}
                    </span>

                    {/* Member Photo Avatar */}
                    {mp.photoUrl ? (
                      <img
                        src={mp.photoUrl}
                        alt={mp.fullName}
                        className="size-28 rounded-full object-cover border-4 border-amber-400 shadow-md group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="size-28 rounded-full bg-gradient-to-br from-navy to-slate-900 border-4 border-amber-400 flex flex-col items-center justify-center text-amber-400 font-serif font-black text-2xl shadow-md">
                        {mp.fullName ? mp.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "MP"}
                      </div>
                    )}

                    {/* Name & Constituency */}
                    <div>
                      <h3 className="font-serif font-black text-lg text-navy dark:text-white leading-snug group-hover:text-amber-600 transition-colors">
                        {mp.fullName}
                      </h3>

                      {mp.role && (
                        <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-black">
                          ⭐ {mp.role}
                        </div>
                      )}

                      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                        {mp.constituency
                          ? `${lang === "fr" ? "Circonscription" : "Constituency"}: ${mp.constituency}`
                          : (lang === "fr" ? "Représentant National" : "National Representative")}
                      </div>
                    </div>

                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 w-full">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-navy text-white text-xs font-black shadow-sm">
                        {mp.partyLogoUrl && (
                          <img src={mp.partyLogoUrl} alt={mp.partyAcronym} className="size-3.5 object-contain rounded-full bg-white p-0.5" />
                        )}
                        {mp.partyAcronym || "IND"}
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                        📍 {mp.regionName || "Cameroon"}
                      </span>

                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold capitalize">
                        {lang === "fr" ? (mp.gender === "female" ? "Femme" : "Homme") : mp.gender}
                      </span>
                    </div>

                    {mp.bio && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pt-1 italic">
                        "{mp.bio}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
