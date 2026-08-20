import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserPlus, Trash2, Pencil, Check, X } from "lucide-react";
import { useProfiles, useInviteAuthor, useUpdateProfileRole } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";

export const Route = createFileRoute("/admin/authors")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: AuthorsPage,
});

const inviteSchema = z.object({
  email: z.string().trim().email("Valid email required"),
  displayName: z.string().trim().min(2, "Name required").max(80),
  role: z.enum(["author", "editor", "admin"]),
});

function AuthorsPage() {
  const profiles = useProfiles();
  const invite = useInviteAuthor();
  const updateRole = useUpdateProfileRole();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"author" | "editor" | "admin">("author");
  const [editing, setEditing] = useState<string | null>(null);
  const [bio, setBio] = useState("");

  const list = (profiles.data ?? []).filter((p: any) =>
    ["author", "editor", "admin"].includes(p.role),
  );

  const submit = async () => {
    const parsed = inviteSchema.safeParse({ email, displayName: name, role });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    try {
      await invite.mutateAsync(parsed.data);
      toast.success(`Invitation sent to ${email}. They can sign in with the magic link.`);
      setEmail("");
      setName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    }
  };

  const saveBio = async (id: string) => {
    try {
      await updateRole.mutateAsync({ id, data: { bio } });
      toast.success("Profile updated");
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    try {
      await updateRole.mutateAsync({ id, data: { role: newRole } });
      toast.success(`Role set to ${newRole}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-black text-3xl text-navy">Authors & Editors</h1>
        <p className="text-sm text-muted-foreground">Invite contributors, manage roles, and edit author bios.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="size-4" /> Invite an author</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_160px_auto]">
              <div className="min-w-0">
                <Label htmlFor="invite-name">Display name</Label>
                <Input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" maxLength={80} />
              </div>
              <div className="min-w-0">
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" maxLength={255} />
              </div>
              <div className="min-w-0">
                <Label htmlFor="invite-role">Role</Label>
                <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm">
                  <option value="author">Author</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={submit} disabled={invite.isPending} className="w-full md:w-auto">
                  {invite.isPending ? "Sending…" : "Send invite"}
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              A magic-link sign-in is emailed to the address. On first sign-in they land in the admin panel with their assigned role.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team ({list.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Name</th>
                    <th className="px-4 py-2 font-semibold">Email</th>
                    <th className="px-4 py-2 font-semibold">Role</th>
                    <th className="px-4 py-2 font-semibold">Bio</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.isLoading && (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Loading…</td></tr>
                  )}
                  {!profiles.isLoading && list.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No authors yet — invite one above.</td></tr>
                  )}
                  {list.map((p: any) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{p.displayName ?? p.display_name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        <select value={p.role} onChange={(e) => changeRole(p.id, e.target.value)} className="rounded border border-border bg-background px-2 py-1 text-xs">
                          <option value="author">Author</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        {editing === p.id ? (
                          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} maxLength={500} />
                        ) : (
                          <span className="line-clamp-2 text-muted-foreground">{p.bio || "—"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editing === p.id ? (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => saveBio(p.id)} className="p-1.5 rounded hover:bg-muted" aria-label="Save"><Check className="size-4 text-green-600" /></button>
                            <button onClick={() => setEditing(null)} className="p-1.5 rounded hover:bg-muted" aria-label="Cancel"><X className="size-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditing(p.id); setBio(p.bio ?? ""); }} className="p-1.5 rounded hover:bg-muted" aria-label="Edit"><Pencil className="size-4" /></button>
                        )}
                      </td>
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
