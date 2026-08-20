import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSettings, useUpdateSettings } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { useEffect, useState } from "react";
import { Radio, Tv, Youtube, Facebook, Video, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/live")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: LiveManager,
});

function getCastrKey(urlOrKey: string): string {
  if (!urlOrKey) return "";
  if (urlOrKey.includes("/")) {
    const segments = urlOrKey.trim().split("/");
    return segments[segments.length - 1] || "";
  }
  return urlOrKey.trim();
}

function LiveManager() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const user = getStoredUser();

  // Stream Keys & Platform State
  const [castrEmbedUrl, setCastrEmbedUrl] = useState("");
  const [castrKey, setCastrKey] = useState("");
  const [castrLiveBlinking, setCastrLiveBlinking] = useState(true);

  const [youtubeLiveLink, setYoutubeLiveLink] = useState("");
  const [youtubeLiveBlinking, setYoutubeLiveBlinking] = useState(true);

  const [facebookLiveLink, setFacebookLiveLink] = useState("");
  const [facebookLiveBlinking, setFacebookLiveBlinking] = useState(true);

  const [defaultLivePlatform, setDefaultLivePlatform] = useState<"castr" | "youtube" | "facebook">("castr");

  // Broadcast TV Experience State
  const [tvTickerText, setTvTickerText] = useState("");
  const [tvTickerEnabled, setTvTickerEnabled] = useState(true);
  const [tvChannelName, setTvChannelName] = useState("");
  const [tvProgramTitle, setTvProgramTitle] = useState("");
  const [tvShowWatermark, setTvShowWatermark] = useState(true);

  useEffect(() => {
    if (settings) {
      const rawUrl = (settings as any).castrEmbedUrl ?? "https://player.castr.com/live_e2e9014087fe11f1b03d23af8a49dd2b";
      setCastrEmbedUrl(rawUrl);
      setCastrKey(getCastrKey(rawUrl));
      setCastrLiveBlinking((settings as any).castrLiveBlinking ?? true);

      setYoutubeLiveLink((settings as any).youtubeLiveLink ?? "https://www.youtube.com/watch?v=jfKfPfyJRdk");
      setYoutubeLiveBlinking((settings as any).youtubeLiveBlinking ?? true);

      setFacebookLiveLink((settings as any).facebookLiveLink ?? "https://www.facebook.com/watch/live");
      setFacebookLiveBlinking((settings as any).facebookLiveBlinking ?? true);

      setDefaultLivePlatform((settings as any).defaultLivePlatform ?? "castr");

      setTvTickerText((settings as any).tvTickerText ?? "EAGLE PRESS TV • LIVE PARLIAMENTARY PLENARY SESSION FROM YAOUNDÉ • CAMEROON LEGISLATIVE DEBATES •");
      setTvTickerEnabled((settings as any).tvTickerEnabled ?? true);
      setTvChannelName((settings as any).tvChannelName ?? "EAGLE PRESS TV");
      setTvProgramTitle((settings as any).tvProgramTitle ?? "LIVE PARLIAMENTARY PRESS");
      setTvShowWatermark((settings as any).tvShowWatermark ?? true);
    }
  }, [settings]);

  const handleSave = () => {
    if (!user?.id) {
      toast.error("Unauthorized. Please sign in.");
      return;
    }

    const payload = {
      castrEmbedUrl,
      castrLiveBlinking,
      youtubeLiveLink,
      youtubeLiveBlinking,
      facebookLiveLink,
      facebookLiveBlinking,
      defaultLivePlatform,
      tvTickerText,
      tvTickerEnabled,
      tvChannelName,
      tvProgramTitle,
      tvShowWatermark,
    };

    updateSettings.mutate(
      { userId: user.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Live Broadcast Manager settings updated successfully!");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update Live Manager settings.");
        },
      }
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-navy font-bold">Loading Live Manager…</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="size-6 text-red-600 animate-pulse" />
            <h1 className="font-serif font-black text-3xl text-navy">Live Manager</h1>
            <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-2 py-0.5 rounded shadow-sm">
              TV BROADCAST
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage Castr, YouTube, &amp; Facebook live stream secret keys, blinking live indicators, and TV ticker flows.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="bg-navy hover:bg-navy/90 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 shadow-md flex items-center gap-2"
        >
          {updateSettings.isPending ? (
            "Saving Live Settings…"
          ) : (
            <>
              <CheckCircle2 className="size-4 text-amber-400" /> Save Live Settings
            </>
          )}
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Stream Keys & Toggles (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Platform Default Selection */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-navy font-serif">
                <Video className="size-5 text-amber-500" /> Primary Live Stream Platform
              </CardTitle>
              <CardDescription className="text-xs">
                Select which platform powers the default live player overlay across the website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDefaultLivePlatform("castr")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    defaultLivePlatform === "castr"
                      ? "bg-navy text-white border-amber-400 ring-2 ring-amber-400/50 shadow-md"
                      : "bg-card hover:bg-accent text-navy border-border"
                  }`}
                >
                  <Tv className="size-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Castr (TV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDefaultLivePlatform("youtube")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    defaultLivePlatform === "youtube"
                      ? "bg-red-600 text-white border-red-400 ring-2 ring-red-400/50 shadow-md"
                      : "bg-card hover:bg-accent text-navy border-border"
                  }`}
                >
                  <Youtube className="size-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">YouTube</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDefaultLivePlatform("facebook")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    defaultLivePlatform === "facebook"
                      ? "bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/50 shadow-md"
                      : "bg-card hover:bg-accent text-navy border-border"
                  }`}
                >
                  <Facebook className="size-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Facebook</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* CASTR LIVE CONFIG */}
          <Card className="border-border/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 font-serif text-navy">
                  <Tv className="size-5 text-amber-500" /> Castr Live Secret Stream Key &amp; Embed URL
                </CardTitle>
                <span className="text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-800 px-2 py-0.5 rounded">
                  Broadcast Player
                </span>
              </div>
              <CardDescription className="text-xs">
                Enter your Castr Live Embed URL or player Secret ID (e.g. https://player.castr.com/live_e2e9014087fe11f1b03d23af8a49dd2b).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="castrKey" className="text-xs font-bold uppercase tracking-wider text-navy mb-1.5 block">
                    Castr Stream Key / Player ID
                  </Label>
                  <Input
                    id="castrKey"
                    placeholder="live_e2e9014087fe11f1b03d23af8a49dd2b"
                    value={castrKey}
                    onChange={(e) => {
                      const key = e.target.value;
                      setCastrKey(key);
                      setCastrEmbedUrl(key.trim() ? `https://player.castr.com/${key.trim()}` : "");
                    }}
                    className="bg-background text-xs font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="castrEmbedUrl" className="text-xs font-bold uppercase tracking-wider text-navy mb-1.5 block">
                    Castr Embed URL
                  </Label>
                  <Input
                    id="castrEmbedUrl"
                    placeholder="https://player.castr.com/live_e2e9014087fe11f1b03d23af8a49dd2b"
                    value={castrEmbedUrl}
                    onChange={(e) => {
                      const url = e.target.value;
                      setCastrEmbedUrl(url);
                      setCastrKey(getCastrKey(url));
                    }}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <Label htmlFor="castrLiveBlinking" className="text-xs font-bold text-navy block">
                    Castr LIVE Indicator Pulse / Blink
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    When enabled, the red "LIVE" badge blinks continuously. When disabled, it stays solid red.
                  </span>
                </div>
                <Switch
                  id="castrLiveBlinking"
                  checked={castrLiveBlinking}
                  onCheckedChange={setCastrLiveBlinking}
                />
              </div>
            </CardContent>
          </Card>

          {/* YOUTUBE LIVE CONFIG */}
          <Card className="border-border/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-serif text-navy">
                <Youtube className="size-5 text-red-600" /> YouTube Live Broadcast Secret Key &amp; Video URL
              </CardTitle>
              <CardDescription className="text-xs">
                Enter your YouTube Live broadcast URL or Video ID (e.g. https://www.youtube.com/watch?v=VIDEO_ID).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="youtubeLiveLink" className="text-xs font-bold uppercase tracking-wider text-navy mb-1.5 block">
                  YouTube Live Link / Video ID
                </Label>
                <Input
                  id="youtubeLiveLink"
                  placeholder="https://www.youtube.com/watch?v=jfKfPfyJRdk"
                  value={youtubeLiveLink}
                  onChange={(e) => setYoutubeLiveLink(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <Label htmlFor="youtubeLiveBlinking" className="text-xs font-bold text-navy block">
                    YouTube LIVE Indicator Pulse / Blink
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Toggle blinking motion on the YouTube live badge on air.
                  </span>
                </div>
                <Switch
                  id="youtubeLiveBlinking"
                  checked={youtubeLiveBlinking}
                  onCheckedChange={setYoutubeLiveBlinking}
                />
              </div>
            </CardContent>
          </Card>

          {/* FACEBOOK LIVE CONFIG */}
          <Card className="border-border/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-serif text-navy">
                <Facebook className="size-5 text-blue-600" /> Facebook Live Broadcast Stream Key &amp; Video URL
              </CardTitle>
              <CardDescription className="text-xs">
                Enter your Facebook Live broadcast page or stream link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebookLiveLink" className="text-xs font-bold uppercase tracking-wider text-navy mb-1.5 block">
                  Facebook Live Link / Embed URL
                </Label>
                <Input
                  id="facebookLiveLink"
                  placeholder="https://www.facebook.com/watch/live"
                  value={facebookLiveLink}
                  onChange={(e) => setFacebookLiveLink(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <Label htmlFor="facebookLiveBlinking" className="text-xs font-bold text-navy block">
                    Facebook LIVE Indicator Pulse / Blink
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Toggle blinking motion on the Facebook live badge on air.
                  </span>
                </div>
                <Switch
                  id="facebookLiveBlinking"
                  checked={facebookLiveBlinking}
                  onCheckedChange={setFacebookLiveBlinking}
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: TV Channel Experience & News Ticker Flow (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* TV TICKER & BROADCAST CONTROLS */}
          <Card className="border-border/60 shadow-md bg-gradient-to-br from-slate-900 via-navy to-slate-950 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 font-serif text-white">
                  <Sparkles className="size-5 text-amber-400" /> Broadcast TV News Ticker Flow
                </CardTitle>
                <span className="text-[9px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded animate-pulse">
                  ON AIR FLOW
                </span>
              </div>
              <CardDescription className="text-xs text-slate-300">
                Write scrolling news updates that appear continuously across the bottom of the TV stream player.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tvTickerText" className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 block">
                  Scrolling News Crawler Text (Ticker Flow)
                </Label>
                <Textarea
                  id="tvTickerText"
                  rows={3}
                  placeholder="EAGLE 1 PRESS TV • LIVE DEBATE ON 2026 FINANCIAL BILL • SENATE PLENARY RESUMES AT 14:00 GMT •"
                  value={tvTickerText}
                  onChange={(e) => setTvTickerText(e.target.value)}
                  className="bg-black/60 border-white/20 text-white text-xs placeholder:text-slate-500 focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <Label htmlFor="tvTickerEnabled" className="text-xs font-bold text-white block">
                    Enable TV News Ticker Crawler
                  </Label>
                  <span className="text-[10px] text-slate-400">Show/hide news ticker flow on live player.</span>
                </div>
                <Switch
                  id="tvTickerEnabled"
                  checked={tvTickerEnabled}
                  onCheckedChange={setTvTickerEnabled}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <Label htmlFor="tvChannelName" className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 block">
                    TV Channel Watermark Name
                  </Label>
                  <Input
                    id="tvChannelName"
                    value={tvChannelName}
                    onChange={(e) => setTvChannelName(e.target.value)}
                    className="bg-black/60 border-white/20 text-white text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="tvProgramTitle" className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 block">
                    Current Program Title
                  </Label>
                  <Input
                    id="tvProgramTitle"
                    value={tvProgramTitle}
                    onChange={(e) => setTvProgramTitle(e.target.value)}
                    className="bg-black/60 border-white/20 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <Label htmlFor="tvShowWatermark" className="text-xs font-bold text-white block">
                    Show Channel Watermark Overlay
                  </Label>
                  <span className="text-[10px] text-slate-400">Display TV station badge on top-left of player.</span>
                </div>
                <Switch
                  id="tvShowWatermark"
                  checked={tvShowWatermark}
                  onCheckedChange={setTvShowWatermark}
                />
              </div>
            </CardContent>
          </Card>

          {/* LIVE TV PREVIEW BOX */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-navy flex items-center justify-between">
                <span>Real-Time Broadcast TV Preview</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold">
                  LIVE PREVIEW
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simulated TV Frame */}
              <div className="relative aspect-video w-full rounded-xl bg-black overflow-hidden shadow-inner border border-slate-800">
                {/* Station Watermark */}
                {tvShowWatermark && (
                  <div className="absolute top-3 left-3 z-20 bg-black/70 border border-white/15 px-2.5 py-1 rounded flex items-center gap-2 backdrop-blur-md">
                    <span className={`size-2 rounded-full ${castrLiveBlinking ? "bg-red-600 animate-pulse" : "bg-red-600"}`} />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">
                      {tvChannelName || "EAGLE 1 PRESS TV"}
                    </span>
                  </div>
                )}

                {/* Simulated Video Feed background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-navy/80 to-slate-900 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Tv className="size-8 text-amber-400 mx-auto mb-2 animate-pulse" />
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      {tvProgramTitle || "LIVE PARLIAMENTARY PRESS"}
                    </div>
                    <div className="text-[10px] text-white/60 mt-0.5">Platform: {defaultLivePlatform.toUpperCase()}</div>
                  </div>
                </div>

                {/* TV News Ticker Crawler Flow */}
                {tvTickerEnabled && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white py-1.5 px-3 z-20 flex items-center overflow-hidden border-t border-red-500/50 shadow-md">
                    <div className="shrink-0 font-black text-[9px] uppercase tracking-widest bg-black px-2 py-0.5 rounded mr-3 text-amber-400">
                      BREAKING
                    </div>
                    <div className="text-[10px] font-bold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                      {tvTickerText || "EAGLE 1 PRESS TV • LIVE PARLIAMENTARY PLENARY SESSION •"}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Live Broadcast Security Note:</span>
              Stream keys updated here are securely broadcast to all active visitors viewing Castr, YouTube, or Facebook channels without requiring a site rebuild.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
