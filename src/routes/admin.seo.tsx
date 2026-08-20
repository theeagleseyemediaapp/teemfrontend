import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSeoDefault, useArticleSeo, useSettings } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { useState } from "react";

export const Route = createFileRoute("/admin/seo")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: Seo,
});

function Seo() {
  const defaultSeo = useAdminSeoDefault();
  const settings = useSettings();
  const user = getStoredUser();

  return (
    <div className="space-y-6">
      <h1 className="font-serif font-black text-3xl text-navy">SEO</h1>

      <Card>
        <CardHeader>
          <CardTitle>Default SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {defaultSeo.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          <div>
            <Label>Site Name</Label>
            <p className="text-sm text-navy font-semibold">{defaultSeo.data?.siteName ?? "-"}</p>
          </div>
          <div>
            <Label>Default Description</Label>
            <p className="text-sm text-muted-foreground">{defaultSeo.data?.description ?? "-"}</p>
          </div>
          <div>
            <Label>Support Email</Label>
            <p className="text-sm text-muted-foreground">{defaultSeo.data?.supportEmail ?? "-"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global Meta (from Site Settings)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          <div>
            <Label>Site Name</Label>
            <p className="text-sm text-navy font-semibold">{settings.data?.siteName ?? "-"}</p>
          </div>
          <div>
            <Label>Description</Label>
            <p className="text-sm text-muted-foreground">{settings.data?.description ?? "-"}</p>
          </div>
          <div>
            <Label>Keywords</Label>
            <p className="text-sm text-muted-foreground">Cameroon news, parliamentary news, National Assembly, Senate, politics</p>
          </div>
          <div>
            <Label>OG Image</Label>
            <img src="/logo.png" alt="OG" className="h-16 w-auto rounded border border-border" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
