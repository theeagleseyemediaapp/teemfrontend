import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mpApi as api } from "@/lib/api";
import { compressAndUploadImage } from "@/lib/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Plus,
  Trash2,
  Edit,
  MapPin,
  Flag,
  Upload,
  Loader2,
  Search,
  CheckCircle,
  AlertCircle,
  Filter,
  ImageIcon,
} from "lucide-react";
export type PoliticalParty = {
  id: string;
  name: string;
  acronym: string;
  logoUrl?: string;
  mpCount?: number;
};

export type ParliamentRegion = {
  id: string;
  name: string;
  code: string;
  mapImageUrl?: string;
  mpCount?: number;
};

export type MemberOfParliament = {
  id: string;
  fullName: string;
  photoUrl?: string;
  partyId?: string;
  partyName?: string;
  partyAcronym?: string;
  regionId?: string;
  regionName?: string;
  gender: string;
  constituency?: string;
  bio?: string;
};

export const Route = createFileRoute("/admin/mps")({
  component: AdminMpsPage,
});

function AdminMpsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"mps" | "parties" | "regions">("mps");

  // Filters
  const [selectedPartyFilter, setSelectedPartyFilter] = useState<string>("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("");
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [mpModalOpen, setMpModalOpen] = useState(false);
  const [editingMp, setEditingMp] = useState<MemberOfParliament | null>(null);

  const [partyModalOpen, setPartyModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<PoliticalParty | null>(null);

  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<ParliamentRegion | null>(null);

  // Uploading state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingPartyLogo, setUploadingPartyLogo] = useState(false);
  const [uploadingRegionMap, setUploadingRegionMap] = useState(false);

  const handleMpPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const res = await compressAndUploadImage(file);
      if (res?.url) {
        setMpForm((prev) => ({ ...prev, photoUrl: res.url }));
      }
    } catch (err: any) {
      alert("Failed to upload MP photo: " + (err.message || "Unknown error"));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePartyLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPartyLogo(true);
      const res = await compressAndUploadImage(file);
      if (res?.url) {
        setPartyForm((prev) => ({ ...prev, logoUrl: res.url }));
      }
    } catch (err: any) {
      alert("Failed to upload party logo: " + (err.message || "Unknown error"));
    } finally {
      setUploadingPartyLogo(false);
    }
  };

  const handleRegionMapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingRegionMap(true);
      const res = await compressAndUploadImage(file);
      if (res?.url) {
        setRegionForm((prev) => ({ ...prev, mapImageUrl: res.url }));
      }
    } catch (err: any) {
      alert("Failed to upload region map image: " + (err.message || "Unknown error"));
    } finally {
      setUploadingRegionMap(false);
    }
  };

  // Queries
  const partiesQuery = useQuery({
    queryKey: ["political-parties"],
    queryFn: () => api.getPoliticalParties(),
  });

  const regionsQuery = useQuery({
    queryKey: ["parliament-regions"],
    queryFn: () => api.getParliamentRegions(),
  });

  const mpsQuery = useQuery({
    queryKey: ["mps", selectedPartyFilter, selectedRegionFilter, selectedGenderFilter],
    queryFn: () =>
      api.getMps({
        partyId: selectedPartyFilter || undefined,
        regionId: selectedRegionFilter || undefined,
        gender: selectedGenderFilter || undefined,
      }),
  });

  // MP Form State
  const [mpForm, setMpForm] = useState({
    fullName: "",
    photoUrl: "",
    partyId: "",
    regionId: "",
    gender: "male",
    constituency: "",
    bio: "",
  });

  // Party Form State
  const [partyForm, setPartyForm] = useState({
    name: "",
    acronym: "",
    logoUrl: "",
  });

  // Region Form State
  const [regionForm, setRegionForm] = useState({
    name: "",
    mapImageUrl: "",
  });

  // MP Mutations
  const createMpMutation = useMutation({
    mutationFn: (data: typeof mpForm) => api.createMp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mps"] });
      queryClient.invalidateQueries({ queryKey: ["mp-analytics"] });
      setMpModalOpen(false);
      resetMpForm();
    },
  });

  const updateMpMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof mpForm> }) =>
      api.updateMp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mps"] });
      queryClient.invalidateQueries({ queryKey: ["mp-analytics"] });
      setMpModalOpen(false);
      resetMpForm();
    },
  });

  const deleteMpMutation = useMutation({
    mutationFn: (id: string) => api.deleteMp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mps"] });
      queryClient.invalidateQueries({ queryKey: ["mp-analytics"] });
    },
  });

  // Party Mutations
  const createPartyMutation = useMutation({
    mutationFn: (data: typeof partyForm) => api.createPoliticalParty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["political-parties"] });
      queryClient.invalidateQueries({ queryKey: ["mp-analytics"] });
      setPartyModalOpen(false);
      resetPartyForm();
    },
  });

  const updatePartyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof partyForm> }) =>
      api.updatePoliticalParty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["political-parties"] });
      queryClient.invalidateQueries({ queryKey: ["mps"] });
      setPartyModalOpen(false);
      resetPartyForm();
    },
  });

  const deletePartyMutation = useMutation({
    mutationFn: (id: string) => api.deletePoliticalParty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["political-parties"] });
      queryClient.invalidateQueries({ queryKey: ["mps"] });
    },
  });

  // Region Mutations
  const updateRegionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof regionForm> }) =>
      api.updateParliamentRegion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parliament-regions"] });
      setRegionModalOpen(false);
    },
  });

  const resetMpForm = () => {
    setEditingMp(null);
    setMpForm({
      fullName: "",
      photoUrl: "",
      partyId: partiesQuery.data?.[0]?.id || "",
      regionId: regionsQuery.data?.[0]?.id || "",
      gender: "male",
      constituency: "",
      bio: "",
    });
  };

  const resetPartyForm = () => {
    setEditingParty(null);
    setPartyForm({ name: "", acronym: "", logoUrl: "" });
  };

  const handleEditMp = (mp: MemberOfParliament) => {
    setEditingMp(mp);
    setMpForm({
      fullName: mp.fullName,
      photoUrl: mp.photoUrl || "",
      partyId: mp.partyId || "",
      regionId: mp.regionId || "",
      gender: mp.gender || "male",
      constituency: mp.constituency || "",
      bio: mp.bio || "",
    });
    setMpModalOpen(true);
  };

  const handleEditParty = (party: PoliticalParty) => {
    setEditingParty(party);
    setPartyForm({
      name: party.name,
      acronym: party.acronym,
      logoUrl: party.logoUrl || "",
    });
    setPartyModalOpen(true);
  };

  const handleEditRegion = (region: ParliamentRegion) => {
    setEditingRegion(region);
    setRegionForm({
      name: region.name,
      mapImageUrl: region.mapImageUrl || "",
    });
    setRegionModalOpen(true);
  };

  const mpsList = (mpsQuery.data ?? []).filter((mp: any) =>
    mp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (mp.constituency && mp.constituency.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-3xl text-navy dark:text-white">
            Members of Parliament & Political Parties
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage National Assembly MPs, Political Parties, and 10 Cameroon Region map graphics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "mps" && (
            <Button
              onClick={() => {
                resetMpForm();
                setMpModalOpen(true);
              }}
              className="bg-navy hover:bg-navy/95 text-white flex items-center gap-1.5"
            >
              <Plus className="size-4" /> Add MP
            </Button>
          )}
          {activeTab === "parties" && (
            <Button
              onClick={() => {
                resetPartyForm();
                setPartyModalOpen(true);
              }}
              className="bg-navy hover:bg-navy/95 text-white flex items-center gap-1.5"
            >
              <Plus className="size-4" /> Add Political Party
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList className="bg-slate-200 dark:bg-slate-800">
          <TabsTrigger value="mps" className="flex items-center gap-1.5">
            <Users className="size-4" /> MPs Directory ({(mpsQuery.data ?? []).length})
          </TabsTrigger>
          <TabsTrigger value="parties" className="flex items-center gap-1.5">
            <Flag className="size-4" /> Political Parties ({(partiesQuery.data ?? []).length})
          </TabsTrigger>
          <TabsTrigger value="regions" className="flex items-center gap-1.5">
            <MapPin className="size-4" /> 10 Regions Maps ({(regionsQuery.data ?? []).length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: MPs Directory */}
        <TabsContent value="mps" className="space-y-4 pt-2">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="size-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search MP name or constituency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedPartyFilter}
                onChange={(e) => setSelectedPartyFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Political Parties</option>
                {(partiesQuery.data ?? []).map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.acronym} - {p.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedRegionFilter}
                onChange={(e) => setSelectedRegionFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All 10 Regions</option>
                {(regionsQuery.data ?? []).map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>

              <select
                value={selectedGenderFilter}
                onChange={(e) => setSelectedGenderFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* MPs Table / Grid */}
          <Card className="bg-white dark:bg-slate-900">
            <CardContent className="p-0">
              {mpsQuery.isLoading ? (
                <div className="p-8 text-center text-slate-500">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2" />
                  Loading Members of Parliament...
                </div>
              ) : mpsList.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No Members of Parliament found matching your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-bold text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="p-3">Member of Parliament</th>
                        <th className="p-3">Party</th>
                        <th className="p-3">Region</th>
                        <th className="p-3">Gender</th>
                        <th className="p-3">Constituency</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {mpsList.map((mp: any) => (
                        <tr key={mp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {mp.photoUrl ? (
                                <img
                                  src={mp.photoUrl}
                                  alt={mp.fullName}
                                  className="size-10 rounded-full object-cover border border-amber-400"
                                />
                              ) : (
                                <div className="size-10 rounded-full bg-navy text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-400">
                                  {mp.fullName ? mp.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "MP"}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-navy dark:text-white">{mp.fullName}</div>
                                {mp.bio && <div className="text-xs text-slate-500 line-clamp-1">{mp.bio}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                              {mp.partyAcronym || "IND"}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                            {mp.regionName || "Cameroon"}
                          </td>
                          <td className="p-3 capitalize font-medium text-slate-600 dark:text-slate-400">
                            {mp.gender}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {mp.constituency || "National"}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditMp(mp)}
                              className="h-8 px-2 text-xs"
                            >
                              <Edit className="size-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm(`Delete ${mp.fullName}?`)) {
                                  deleteMpMutation.mutate(mp.id);
                                }
                              }}
                              className="h-8 px-2 text-xs"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Political Parties */}
        <TabsContent value="parties" className="space-y-4 pt-2">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(partiesQuery.data ?? []).map((party: any) => (
              <Card key={party.id} className="bg-white dark:bg-slate-900 border-l-4 border-l-amber-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    {party.logoUrl ? (
                      <img src={party.logoUrl} alt={party.acronym} className="size-10 rounded-lg object-contain bg-slate-100 p-1" />
                    ) : (
                      <div className="size-10 rounded-lg bg-navy text-amber-400 font-black flex items-center justify-center text-sm">
                        {party.acronym}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base font-bold text-navy dark:text-white">
                        {party.acronym}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-1">{party.name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500">
                    MPs: <strong className="text-navy dark:text-white text-sm">{party.mpCount || 0}</strong>
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditParty(party)} className="h-7 px-2 text-xs">
                      <Edit className="size-3 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Delete political party ${party.acronym}?`)) {
                          deletePartyMutation.mutate(party.id);
                        }
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: 10 Regions Maps */}
        <TabsContent value="regions" className="space-y-4 pt-2">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(regionsQuery.data ?? []).map((region: any) => (
              <Card key={region.id} className="bg-white dark:bg-slate-900 overflow-hidden relative group border">
                <div className="h-32 bg-slate-900 relative">
                  {region.mapImageUrl ? (
                    <img
                      src={region.mapImageUrl}
                      alt={region.name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-navy via-slate-900 to-slate-950 flex flex-col justify-between p-3">
                      <div className="text-[32px] font-black text-white/10 absolute right-2 top-1 select-none">
                        {region.code}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent p-3 flex flex-col justify-between">
                    <span className="self-end px-2 py-0.5 bg-amber-400 text-navy font-black text-[10px] rounded uppercase">
                      {region.code}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-base">{region.name}</h3>
                      <p className="text-[11px] text-amber-300 font-semibold">{region.mpCount || 0} MPs Allocated</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-2 text-right bg-slate-50 dark:bg-slate-900">
                  <Button size="sm" variant="ghost" onClick={() => handleEditRegion(region)} className="h-7 text-xs w-full">
                    <Upload className="size-3 mr-1.5" /> Upload Map Image
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal: Create/Edit MP */}
      {mpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="font-serif font-black text-xl text-navy dark:text-white">
              {editingMp ? "Edit Member of Parliament" : "Add New Member of Parliament"}
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <Label htmlFor="mpFullName" className="text-xs font-bold uppercase">Full Name *</Label>
                <Input
                  id="mpFullName"
                  value={mpForm.fullName}
                  onChange={(e) => setMpForm({ ...mpForm, fullName: e.target.value })}
                  placeholder="e.g. Rt. Hon. Cavaye Yeguie Djibril"
                  required
                />
              </div>

              <div>
                <Label htmlFor="mpPhotoUrl" className="text-xs font-bold uppercase">Photo (Upload File or URL)</Label>
                <div className="mt-1 flex items-center gap-3">
                  {mpForm.photoUrl ? (
                    <img
                      src={mpForm.photoUrl}
                      alt="Preview"
                      className="size-14 rounded-full object-cover border-2 border-amber-400 shrink-0"
                    />
                  ) : (
                    <div className="size-14 rounded-full bg-slate-100 dark:bg-slate-800 border flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="size-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-bold hover:bg-navy/90 cursor-pointer transition-colors">
                      {uploadingPhoto ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" /> Uploading & Compressing...
                        </>
                      ) : (
                        <>
                          <Upload className="size-3.5" /> Choose Image File
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMpPhotoUpload}
                        disabled={uploadingPhoto}
                        className="hidden"
                      />
                    </label>
                    <Input
                      id="mpPhotoUrl"
                      value={mpForm.photoUrl}
                      onChange={(e) => setMpForm({ ...mpForm, photoUrl: e.target.value })}
                      placeholder="Or paste direct image URL..."
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="mpParty" className="text-xs font-bold uppercase">Political Party *</Label>
                  <select
                    id="mpParty"
                    value={mpForm.partyId}
                    onChange={(e) => setMpForm({ ...mpForm, partyId: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Party</option>
                    {(partiesQuery.data ?? []).map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.acronym} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="mpRegion" className="text-xs font-bold uppercase">Cameroon Region *</Label>
                  <select
                    id="mpRegion"
                    value={mpForm.regionId}
                    onChange={(e) => setMpForm({ ...mpForm, regionId: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Region</option>
                    {(regionsQuery.data ?? []).map((r: any) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="mpGender" className="text-xs font-bold uppercase">Gender *</Label>
                  <select
                    id="mpGender"
                    value={mpForm.gender}
                    onChange={(e) => setMpForm({ ...mpForm, gender: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="mpConstituency" className="text-xs font-bold uppercase">Constituency</Label>
                  <Input
                    id="mpConstituency"
                    value={mpForm.constituency}
                    onChange={(e) => setMpForm({ ...mpForm, constituency: e.target.value })}
                    placeholder="e.g. Mayo-Sava"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  if (editingMp) {
                    updateMpMutation.mutate({ id: editingMp.id, data: mpForm });
                  } else {
                    createMpMutation.mutate(mpForm);
                  }
                }}
                disabled={createMpMutation.isPending || updateMpMutation.isPending || !mpForm.fullName.trim()}
                className="flex-1 bg-navy hover:bg-navy/95 text-white"
              >
                {(createMpMutation.isPending || updateMpMutation.isPending) ? (
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                ) : null}
                {editingMp ? "Save Changes" : "Create Member of Parliament"}
              </Button>

              <Button variant="outline" onClick={() => setMpModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Political Party */}
      {partyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="font-serif font-black text-xl text-navy dark:text-white">
              {editingParty ? "Edit Political Party" : "Add New Political Party"}
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <Label htmlFor="partyAcronym" className="text-xs font-bold uppercase">Party Acronym *</Label>
                <Input
                  id="partyAcronym"
                  value={partyForm.acronym}
                  onChange={(e) => setPartyForm({ ...partyForm, acronym: e.target.value.toUpperCase() })}
                  placeholder="e.g. RDPC, SDF, PCRN"
                  required
                />
              </div>

              <div>
                <Label htmlFor="partyName" className="text-xs font-bold uppercase">Full Party Name *</Label>
                <Input
                  id="partyName"
                  value={partyForm.name}
                  onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
                  placeholder="e.g. Rassemblement Démocratique du Peuple Camerounais"
                  required
                />
              </div>

              <div>
                <Label htmlFor="partyLogoUrl" className="text-xs font-bold uppercase">Party Logo (Upload File or URL)</Label>
                <div className="mt-1 flex items-center gap-3">
                  {partyForm.logoUrl ? (
                    <img
                      src={partyForm.logoUrl}
                      alt="Logo Preview"
                      className="size-14 rounded-lg object-contain bg-slate-100 p-1 border shrink-0"
                    />
                  ) : (
                    <div className="size-14 rounded-lg bg-slate-100 dark:bg-slate-800 border flex items-center justify-center text-slate-400 shrink-0">
                      <Flag className="size-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-bold hover:bg-navy/90 cursor-pointer transition-colors">
                      {uploadingPartyLogo ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" /> Uploading Logo...
                        </>
                      ) : (
                        <>
                          <Upload className="size-3.5" /> Upload Logo File
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePartyLogoUpload}
                        disabled={uploadingPartyLogo}
                        className="hidden"
                      />
                    </label>
                    <Input
                      id="partyLogoUrl"
                      value={partyForm.logoUrl}
                      onChange={(e) => setPartyForm({ ...partyForm, logoUrl: e.target.value })}
                      placeholder="Or paste logo URL..."
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  if (editingParty) {
                    updatePartyMutation.mutate({ id: editingParty.id, data: partyForm });
                  } else {
                    createPartyMutation.mutate(partyForm);
                  }
                }}
                disabled={createPartyMutation.isPending || updatePartyMutation.isPending || uploadingPartyLogo || !partyForm.acronym || !partyForm.name}
                className="flex-1 bg-navy hover:bg-navy/95 text-white"
              >
                {(createPartyMutation.isPending || updatePartyMutation.isPending || uploadingPartyLogo) ? (
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                ) : null}
                {editingParty ? "Save Changes" : "Create Party"}
              </Button>

              <Button variant="outline" onClick={() => setPartyModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Region Map Image */}
      {regionModalOpen && editingRegion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="font-serif font-black text-xl text-navy dark:text-white">
              Update Map Image for {editingRegion.name} Region
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <Label htmlFor="mapImageUrl" className="text-xs font-bold uppercase">Regional Map Image (Upload File or URL)</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-center">
                    {uploadingRegionMap ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-navy dark:text-amber-400">
                        <Loader2 className="size-4 animate-spin" /> Uploading Regional Map...
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Upload className="size-5 text-amber-500" />
                        <span className="text-xs font-bold">Click to choose Map Image File</span>
                        <span className="text-[10px] text-slate-400">JPG, PNG, WebP recommended</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleRegionMapUpload}
                      disabled={uploadingRegionMap}
                      className="hidden"
                    />
                  </label>

                  <Input
                    id="mapImageUrl"
                    value={regionForm.mapImageUrl}
                    onChange={(e) => setRegionForm({ ...regionForm, mapImageUrl: e.target.value })}
                    placeholder="Or paste direct image URL..."
                    className="text-xs"
                  />
                </div>
              </div>

              {regionForm.mapImageUrl ? (
                <div className="h-44 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md">
                  <img src={regionForm.mapImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  updateRegionMutation.mutate({ id: editingRegion.id, data: regionForm });
                }}
                disabled={updateRegionMutation.isPending || uploadingRegionMap}
                className="flex-1 bg-navy hover:bg-navy/95 text-white"
              >
                {(updateRegionMutation.isPending || uploadingRegionMap) && <Loader2 className="size-4 animate-spin mr-1.5" />}
                Save Map Image
              </Button>

              <Button variant="outline" onClick={() => setRegionModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
