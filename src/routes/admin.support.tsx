import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminSupportMessages } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { Mail, Calendar, User, AlignLeft } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/support")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: SupportMessages,
});

function SupportMessages() {
  const support = useAdminSupportMessages();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const messages = Array.isArray(support.data) ? support.data : [];

  return (
    <div className="space-y-6">
      <h1 className="font-serif font-black text-3xl text-navy">Support Messages</h1>
      
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle>Inbound Helpdesk Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {support.isLoading && <p className="text-muted-foreground text-sm">Loading messages...</p>}
            
            {messages.map((m: any) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMessage(m)}
                className={`w-full text-left rounded border p-4 transition-all hover:bg-slate-50 flex flex-col gap-2 ${
                  selectedMessage?.id === m.id ? "border-gold bg-gold/5 shadow-sm" : "border-border"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-navy text-sm truncate max-w-[70%]">{m.subject || "No Subject"}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{m.message}</p>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><User className="size-3 text-gold" /> {m.name}</span>
                  <span className="flex items-center gap-1"><Mail className="size-3 text-gold" /> {m.email}</span>
                </div>
              </button>
            ))}
            
            {!support.isLoading && !messages.length && (
              <p className="text-muted-foreground text-sm">No support messages found.</p>
            )}
          </CardContent>
        </Card>

        {/* Selected Message Detail */}
        <Card className="h-fit sticky top-6">
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-serif font-bold text-navy text-lg">{selectedMessage.subject}</h3>
                  <div className="flex flex-col gap-2 mt-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="size-3.5 text-gold shrink-0" />
                      <span className="font-semibold text-navy">From:</span> {selectedMessage.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="size-3.5 text-gold shrink-0" />
                      <span className="font-semibold text-navy">Email:</span>
                      <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                        {selectedMessage.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-gold shrink-0" />
                      <span className="font-semibold text-navy">Date:</span> {new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-navy flex items-center gap-1.5">
                    <AlignLeft className="size-3.5 text-gold" /> Message Body:
                  </span>
                  <div className="rounded bg-slate-50 border p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    asChild
                    className="w-full bg-navy hover:bg-navy/90 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                      Reply via Email
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
                <Mail className="size-8 text-slate-300" />
                Select a message from the list to view its full details.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
