import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Megaphone, Mail, Bell, Send, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { useBroadcastAnnouncement, useAlerts, useUpdateAlert, useDeleteAlert, useCreateAlert } from '@/lib/api';

import { getStoredUser } from '@/lib/auth-session';
import { playEagleHasLanded } from '@/lib/audio-alerts';

export const Route = createFileRoute('/admin/announcements')({
  beforeLoad: () => { if (!getStoredUser()) throw redirect({ to: '/sign-in' }); },
  component: AnnouncementsPage,
});

type Severity = 'info' | 'warning' | 'breaking';

const SEVERITIES = [
  { value: 'info' as Severity, label: 'Announcement', Icon: Megaphone, cls: 'bg-navy text-white' },
  { value: 'warning' as Severity, label: 'Notice / Warning', Icon: AlertTriangle, cls: 'bg-amber-500 text-white' },
  { value: 'breaking' as Severity, label: 'Breaking News', Icon: Zap, cls: 'bg-red-600 text-white' },
];

function sevBadge(s: string) {
  if (s === 'breaking') return 'bg-red-100 text-red-700 border border-red-200';
  if (s === 'warning') return 'bg-amber-100 text-amber-700 border border-amber-200';
  return 'bg-blue-100 text-blue-700 border border-blue-200';
}

function AnnouncementsPage() {
  const broadcast = useBroadcastAnnouncement();
  const alerts = useAlerts();
  const updateAlert = useUpdateAlert();
  const deleteAlert = useDeleteAlert();
  const createAlert = useCreateAlert();

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteAlert.mutate(id, { onSuccess: () => toast.success('Deleted') });
  };

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [bodyFr, setBodyFr] = useState('');
  const [severity, setSeverity] = useState<Severity>('info');
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);

  const handleBroadcast = async () => {
    if (!title.trim() || !body.trim()) { toast.error('Title and body are required'); return; }
    try {
      if (isBroadcast) {
        await broadcast.mutateAsync({
          title: title.trim(), body: body.trim(),
          titleFr: titleFr.trim() || undefined, bodyFr: bodyFr.trim() || undefined,
          severity, sendEmail,
        });
        toast.success(sendEmail
          ? 'Announcement sent! In-app notification created and emails dispatched.'
          : 'In-app notification created.');
      } else {
        await createAlert.mutateAsync({
          title: title.trim(), body: body.trim(),
          titleFr: titleFr.trim() || undefined, bodyFr: bodyFr.trim() || undefined,
          severity, active: true,
        });
        toast.success('Added to Ticker!');
      }
      playEagleHasLanded();
      setTitle(''); setBody(''); setTitleFr(''); setBodyFr(''); setSeverity('info');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save alert');
    }
  };

  const activeAlerts = (alerts.data ?? []).filter((a: any) => a.active);
  const recentAlerts = (alerts.data ?? []).slice(0, 10);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif font-black text-3xl text-navy flex items-center gap-2">
          <Megaphone className="size-7 text-gold" /> Announcements
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Broadcast to all users as an in-app notification and optionally via email to all subscribers.
        </p>
      </div>

      <Card className="border-navy/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="size-4 text-navy" /> Compose Announcement
          </CardTitle>
          <CardDescription>This will instantly appear in all users&apos; notification feed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">Type</Label>
            <div className="flex gap-2 flex-wrap">
              {SEVERITIES.map(({ value, label, Icon, cls }) => (
                <button key={value} onClick={() => setSeverity(value)}
                  className={['flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2',
                    severity === value ? cls + ' border-transparent shadow-md scale-105' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'].join(' ')}>
                  <Icon className="size-3.5" />{label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Title (English) <span className="text-red-500">*</span></Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. National Assembly session postponed" maxLength={150} />
            </div>
            <div className="space-y-1.5">
              <Label>Title (French - optional)</Label>
              <Input value={titleFr} onChange={(e) => setTitleFr(e.target.value)} placeholder="Titre en francais" maxLength={150} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Body (English) <span className="text-red-500">*</span></Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Announcement body text" rows={4} maxLength={2000} />
              <p className="text-xs text-muted-foreground text-right">{body.length}/2000</p>
            </div>
            <div className="space-y-1.5">
              <Label>Body (French - optional)</Label>
              <Textarea value={bodyFr} onChange={(e) => setBodyFr(e.target.value)} placeholder="Corps du texte en francais" rows={4} maxLength={2000} />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-navy/20 bg-navy/5 p-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={isBroadcast} onChange={() => setIsBroadcast(true)} className="accent-navy" />
                <span className="text-sm font-bold text-navy">Push Notification (Broadcast)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!isBroadcast} onChange={() => setIsBroadcast(false)} className="accent-navy" />
                <span className="text-sm font-bold text-navy">Ticker Only</span>
              </label>
            </div>
            
            {isBroadcast && (
              <div className="flex items-center gap-3 pt-2 border-t border-navy/10">
                <button role="checkbox" aria-checked={sendEmail} onClick={() => setSendEmail(!sendEmail)}
                  className={['size-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                    sendEmail ? 'bg-navy border-navy' : 'bg-white border-gray-300'].join(' ')}>
                  {sendEmail && <CheckCircle2 className="size-3.5 text-white" />}
                </button>
                <div>
                  <label className="text-sm font-medium cursor-pointer flex items-center gap-1.5" onClick={() => setSendEmail(!sendEmail)}>
                    <Mail className="size-3.5 text-navy" /> Also send via email to newsletter subscribers
                  </label>
                  <p className="text-xs text-muted-foreground">
                    An email will be dispatched to all active subscribers in the background.
                  </p>
                </div>
              </div>
            )}
            
            {!isBroadcast && (
              <p className="text-xs text-muted-foreground">
                This notice will ONLY appear scrolling on the top breaking news ticker. It will not drop a push notification to users.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button onClick={handleBroadcast} disabled={broadcast.isPending || createAlert.isPending || !title.trim() || !body.trim()}
              className="bg-navy text-white hover:bg-navy/90 gap-2">
              <Bell className="size-4" />
              {broadcast.isPending || createAlert.isPending ? 'Sending...' : 'Publish'}
            </Button>
            {sendEmail && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="size-3" /> + email to subscribers
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {activeAlerts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-700 flex items-center gap-2">
              <Bell className="size-4" /> Active Notifications ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeAlerts.map((a: any) => (
              <div key={a.id} className="flex items-start justify-between gap-4 p-2 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex-1 min-w-0">
                  <span className={'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ' + sevBadge(a.severity)}>
                    {String(a.severity).toUpperCase()}
                  </span>
                  <p className="text-sm font-semibold text-navy truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.body}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-7 flex-shrink-0"
                    onClick={() => updateAlert.mutate({ id: a.id, data: { active: false } }, { onSuccess: () => toast.success('Deactivated') })}
                    disabled={updateAlert.isPending}>
                    Deactivate
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7 flex-shrink-0 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(a.id, a.title)}
                    disabled={deleteAlert.isPending}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Megaphone className="size-4 text-muted-foreground" /> Announcement History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {recentAlerts.length === 0 && !alerts.isLoading && (
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          )}
          <div className="space-y-2">
            {recentAlerts.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ' + sevBadge(a.severity)}>
                  {String(a.severity).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.body}</p>
                </div>
                <span className={'text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ' + (a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {a.active ? 'ACTIVE' : 'OFF'}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id, a.title)}
                  disabled={deleteAlert.isPending}
                  className="text-xs font-semibold px-2 py-0.5 rounded border text-red-700 border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
