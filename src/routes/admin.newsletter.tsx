import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Send, Users, AlertTriangle } from "lucide-react";
import { useAdminSubscribers, useSendNewsletter, useAdminEmailLogs, useSendTestEmail } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";

export const Route = createFileRoute("/admin/newsletter")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: NewsletterPage,
});

const campaignSchema = z.object({
  subject: z.string().trim().min(3, "Subject required").max(150),
  html: z.string().trim().min(20, "Body too short").max(40000),
  preview: z.string().trim().max(200).optional(),
  recipientType: z.enum(["subscribers", "all_users", "specific"]),
  targetEmail: z.string().trim().email("Valid email required").optional().or(z.literal("")),
});

const SMTP_PLACEHOLDER_HINT = "If sending fails, the backend SMTP env vars are still placeholders. Ask the developer to set SMTP_USER, SMTP_PASS, SMTP_FROM in Render.";

function NewsletterPage() {
  const subs = useAdminSubscribers();
  const logs = useAdminEmailLogs();
  const send = useSendNewsletter();
  const sendTest = useSendTestEmail();

  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState("");
  const [html, setHtml] = useState("");
  const [testTo, setTestTo] = useState("");
  const [recipientType, setRecipientType] = useState<"subscribers" | "all_users" | "specific">("subscribers");
  const [targetEmail, setTargetEmail] = useState("");

  const subscribers = subs.data ?? [];
  const recentLogs = (logs.data ?? []).slice(0, 10);

  const submit = async () => {
    const parsed = campaignSchema.safeParse({ subject, html, preview, recipientType, targetEmail });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    try {
      await send.mutateAsync(parsed.data);
      let msg = "Campaign queued";
      if (parsed.data.recipientType === "subscribers") msg = `Campaign queued to ${subscribers.length} subscribers`;
      if (parsed.data.recipientType === "all_users") msg = `Campaign queued to all users`;
      if (parsed.data.recipientType === "specific") msg = `Campaign queued to ${parsed.data.targetEmail}`;
      toast.success(msg);
      setSubject("");
      setHtml("");
      setPreview("");
      setTargetEmail("");
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Send failed") + " — " + SMTP_PLACEHOLDER_HINT);
    }
  };

  const submitTest = async () => {
    if (!testTo.trim() || !subject.trim() || !html.trim()) {
      toast.error("Fill subject, body, and test address");
      return;
    }
    try {
      await sendTest.mutateAsync({ to: testTo, subject, html });
      toast.success(`Test sent to ${testTo}`);
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "Test failed") + " — " + SMTP_PLACEHOLDER_HINT);
    }
  };

  return (
    <div className="space-y-6">
      <div>
          <h1 className="font-serif font-black text-3xl text-navy">Newsletter</h1>
          <p className="text-sm text-muted-foreground">Compose campaigns and manage subscribers.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="size-4" /> Subscribers</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-navy">{subs.isLoading ? "…" : subscribers.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Send className="size-4" /> Sent (logged)</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-navy">{logs.isLoading ? "…" : (logs.data ?? []).length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Mail className="size-4" /> Status</CardTitle></CardHeader>
            <CardContent><div className="text-sm font-bold text-amber-600 flex items-center gap-1"><AlertTriangle className="size-4" /> Check SMTP</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Send className="size-4" /> Compose campaign</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subj">Subject</Label>
              <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="This week in Cameroon's Parliament" maxLength={150} />
            </div>
            <div>
              <Label htmlFor="prev">Preview text (optional)</Label>
              <Input id="prev" value={preview} onChange={(e) => setPreview(e.target.value)} placeholder="Brief teaser shown next to the subject in inbox" maxLength={200} />
            </div>
            <div>
              <Label htmlFor="html">Body (HTML allowed)</Label>
              <Textarea id="html" value={html} onChange={(e) => setHtml(e.target.value)} rows={12} placeholder={`<h1>This week...</h1>\n<p>...</p>`} />
              <p className="mt-1 text-xs text-muted-foreground">Footer with unsubscribe link is appended automatically server-side.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 p-3 bg-muted/30 rounded-md border border-border">
              <div>
                <Label htmlFor="recipient">Send To</Label>
                <select id="recipient" value={recipientType} onChange={(e) => setRecipientType(e.target.value as any)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm mt-1">
                  <option value="subscribers">Newsletter Subscribers ({subscribers.length})</option>
                  <option value="all_users">All Platform Users</option>
                  <option value="specific">Specific User</option>
                </select>
              </div>
              {recipientType === "specific" && (
                <div>
                  <Label htmlFor="target-email">Specific Email Address</Label>
                  <Input id="target-email" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} placeholder="user@example.com" type="email" className="mt-1" />
                </div>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <Input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="Test send to address…" type="email" />
              <Button type="button" variant="outline" onClick={submitTest} disabled={sendTest.isPending}>
                {sendTest.isPending ? "Sending…" : "Send test"}
              </Button>
              <Button type="button" onClick={submit} disabled={send.isPending || (recipientType === "subscribers" && subscribers.length === 0)}>
                {send.isPending ? "Sending…" : "Broadcast Campaign"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Subscribers ({subscribers.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left sticky top-0">
                  <tr><th className="px-4 py-2">Email</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Joined</th></tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">No subscribers yet.</td></tr>
                  )}
                  {subscribers.map((s: any) => (
                    <tr key={s.id ?? s.email} className="border-t border-border">
                      <td className="px-4 py-2 font-mono text-xs">{s.email}</td>
                      <td className="px-4 py-2">{s.name ?? "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent sends</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr><th className="px-4 py-2">To</th><th className="px-4 py-2">Subject</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">When</th></tr>
                </thead>
                <tbody>
                  {recentLogs.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No sends yet.</td></tr>
                  )}
                  {recentLogs.map((l: any) => (
                    <tr key={l.id} className="border-t border-border">
                      <td className="px-4 py-2 font-mono text-xs">{l.to ?? "—"}</td>
                      <td className="px-4 py-2">{l.subject ?? "—"}</td>
                      <td className="px-4 py-2"><span className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${l.status === "sent" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{l.status ?? "—"}</span></td>
                      <td className="px-4 py-2 text-muted-foreground">{l.createdAt ? new Date(l.createdAt).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
