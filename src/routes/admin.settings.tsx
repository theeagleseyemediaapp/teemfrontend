import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSettings, useUpdateSettings } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/settings")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: Settings,
});

function getCastrKey(urlOrKey: string): string {
  if (!urlOrKey) return "";
  if (urlOrKey.includes("/")) {
    const segments = urlOrKey.trim().split("/");
    return segments[segments.length - 1] || "";
  }
  return urlOrKey.trim();
}

function Settings() {
  const settings = useSettings();
  const update = useUpdateSettings();
  const user = getStoredUser();
  const [siteName, setSiteName] = useState("");
  const [description, setDescription] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [noticeEnabled, setNoticeEnabled] = useState(true);
  const [aiSearchEnabled, setAiSearchEnabled] = useState(true);
  const [youtubeLiveLink, setYoutubeLiveLink] = useState("");
  const [castrEmbedUrl, setCastrEmbedUrl] = useState("");
  const [castrKey, setCastrKey] = useState("");

  // Ad settings states
  const [adBannerImageUrl, setAdBannerImageUrl] = useState("");
  const [adBannerLinkUrl, setAdBannerLinkUrl] = useState("");
  const [adBannerEnabled, setAdBannerEnabled] = useState(true);
  const [googleAdsEnabled, setGoogleAdsEnabled] = useState(false);
  const [googleAdsenseClientId, setGoogleAdsenseClientId] = useState("");
  const [googleAdsenseSlotId, setGoogleAdsenseSlotId] = useState("");

  useEffect(() => {
    if (settings.data) {
      setSiteName(settings.data.siteName ?? "");
      setDescription(settings.data.description ?? "");
      setSupportEmail(settings.data.supportEmail ?? "");
      setNoticeEnabled(settings.data.noticeEnabled ?? true);
      setAiSearchEnabled(settings.data.aiSearchEnabled ?? true);
      setAdBannerImageUrl(settings.data.adBannerImageUrl ?? "");
      setAdBannerLinkUrl(settings.data.adBannerLinkUrl ?? "");
      setAdBannerEnabled(settings.data.adBannerEnabled ?? true);
      setGoogleAdsEnabled(settings.data.googleAdsEnabled ?? false);
      setGoogleAdsenseClientId(settings.data.googleAdsenseClientId ?? "");
      setGoogleAdsenseSlotId(settings.data.googleAdsenseSlotId ?? "");
      setYoutubeLiveLink((settings.data as any).youtubeLiveLink ?? "");
      const rawUrl = (settings.data as any).castrEmbedUrl ?? "";
      setCastrEmbedUrl(rawUrl);
      setCastrKey(getCastrKey(rawUrl));
    }
  }, [settings.data]);

  return (
    <div className="space-y-6">
      <h1 className="font-serif font-black text-3xl text-navy">Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Site Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="youtubeLiveLink">YouTube Live Broadcast Link</Label>
              <Input id="youtubeLiveLink" placeholder="e.g. https://www.youtube.com/watch?v=VIDEO_ID" value={youtubeLiveLink} onChange={(e) => setYoutubeLiveLink(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="castrKey">Castr Key / Player ID</Label>
                <Input
                  id="castrKey"
                  placeholder="live_e2e9014087fe11f1b03d23af8a49dd2b"
                  value={castrKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setCastrKey(key);
                    setCastrEmbedUrl(key.trim() ? `https://player.castr.com/${key.trim()}` : "");
                  }}
                />
              </div>
              <div>
                <Label htmlFor="castrEmbedUrl">Castr Embed URL</Label>
                <Input
                  id="castrEmbedUrl"
                  placeholder="https://player.castr.com/live_e2e9014087fe11f1b03d23af8a49dd2b"
                  value={castrEmbedUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setCastrEmbedUrl(url);
                    setCastrKey(getCastrKey(url));
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input id="supportEmail" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="noticeEnabled" checked={noticeEnabled} onCheckedChange={setNoticeEnabled} />
              <Label htmlFor="noticeEnabled">Enable Notice Bar</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="aiSearchEnabled" checked={aiSearchEnabled} onCheckedChange={setAiSearchEnabled} />
              <Label htmlFor="aiSearchEnabled">Enable AI Search</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advertisement &amp; Banner Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="adBannerEnabled" checked={adBannerEnabled} onCheckedChange={setAdBannerEnabled} />
              <Label htmlFor="adBannerEnabled">Enable Ad Banner Slot</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="googleAdsEnabled" checked={googleAdsEnabled} onCheckedChange={setGoogleAdsEnabled} />
              <Label htmlFor="googleAdsEnabled">Enable Google AdSense (Subscribed Ads)</Label>
            </div>

            {googleAdsEnabled ? (
              <>
                <div>
                  <Label htmlFor="googleAdsenseClientId">Google AdSense Client ID (Publisher ID)</Label>
                  <Input 
                    id="googleAdsenseClientId" 
                    placeholder="e.g. ca-pub-xxxxxxxxxxxxxxxx"
                    value={googleAdsenseClientId} 
                    onChange={(e) => setGoogleAdsenseClientId(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="googleAdsenseSlotId">Google AdSense Slot ID</Label>
                  <Input 
                    id="googleAdsenseSlotId" 
                    placeholder="e.g. 1234567890"
                    value={googleAdsenseSlotId} 
                    onChange={(e) => setGoogleAdsenseSlotId(e.target.value)} 
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="adBannerImageUrl">Custom Banner Image URL</Label>
                  <Input 
                    id="adBannerImageUrl" 
                    placeholder="e.g. /logo.png"
                    value={adBannerImageUrl} 
                    onChange={(e) => setAdBannerImageUrl(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="adBannerLinkUrl">Custom Banner Link URL</Label>
                  <Input 
                    id="adBannerLinkUrl" 
                    placeholder="e.g. /about"
                    value={adBannerLinkUrl} 
                    onChange={(e) => setAdBannerLinkUrl(e.target.value)} 
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          disabled={!user || update.isPending}
          onClick={() => user && update.mutate({
            userId: user.id,
            data: { 
              siteName, 
              description, 
              supportEmail, 
              noticeEnabled, 
              aiSearchEnabled,
              adBannerImageUrl,
              adBannerLinkUrl,
              adBannerEnabled,
              googleAdsEnabled,
              googleAdsenseClientId,
              googleAdsenseSlotId,
              youtubeLiveLink,
              castrEmbedUrl,
            },
          })}
        >
          {update.isPending ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
