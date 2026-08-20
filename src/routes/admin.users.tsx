import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfiles, useUpdateProfile } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { useState } from "react";

type UsersSearch = {
  role?: string;
};

export const Route = createFileRoute("/admin/users")({
  validateSearch: (search: Record<string, unknown>): UsersSearch => {
    return {
      role: search.role as string | undefined,
    };
  },
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: Users,
});

type ProfileRow = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  aiSearchSuggestionsEnabled: boolean;
  createdAt: string;
};

function Users() {
  const { role } = Route.useSearch();
  const profiles = useProfiles();
  const updateProfile = useUpdateProfile();
  const user = getStoredUser();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<{ displayName: string; email: string; role: string }>({ displayName: "", email: "", role: "reader" });

  const filtered = (profiles.data ?? []).filter((p: ProfileRow) => {
    if (!role) return true;
    return p.role === role;
  });

  const startEdit = (p: ProfileRow) => {
    setEditingId(p.id);
    setEdits({ displayName: p.displayName, email: p.email, role: p.role });
  };

  const saveEdit = (id: string) => {
    updateProfile.mutate({ id, data: edits }, { onSuccess: () => setEditingId(null) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif font-black text-3xl text-navy">{role === "author" ? "Authors" : "Users"}</h1>
        {role && (
          <Link to="/admin/users" className="text-sm text-muted-foreground hover:text-navy">Show all users</Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {profiles.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          <div className="divide-y divide-border">
            {filtered.map((p: ProfileRow) => (
              <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {editingId === p.id ? (
                  <div className="flex-1 grid gap-3 sm:grid-cols-3">
                    <Input value={edits.displayName} onChange={(e) => setEdits({ ...edits, displayName: e.target.value })} placeholder="Name" />
                    <Input value={edits.email} onChange={(e) => setEdits({ ...edits, email: e.target.value })} placeholder="Email" />
                    {user?.role === 'super_admin' ? (
                      <select value={edits.role} onChange={(e) => setEdits({ ...edits, role: e.target.value })} className="rounded border border-border bg-background px-3 py-2 text-sm">
                        <option value="reader">Reader</option>
                        <option value="author">Author</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    ) : (
                      <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-2 border border-border rounded">
                        {p.role} (Role locked)
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold text-navy">{p.displayName}</div>
                    <div className="text-sm text-muted-foreground">{p.email}</div>
                    <div className="text-xs text-muted-foreground">AI Search: {p.aiSearchSuggestionsEnabled ? "Enabled" : "Disabled"}</div>
                  </div>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  {editingId === p.id ? (
                    <>
                      <Button size="sm" onClick={() => saveEdit(p.id)} disabled={updateProfile.isPending}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    // Only super_admin or admin can edit profiles, but only super_admin can change roles.
                    <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                    p.role === 'super_admin' ? 'bg-red-100 text-red-800 border border-red-200' :
                    p.role === 'admin' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    p.role === 'editor' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {p.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
