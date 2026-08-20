import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminComments, useModerateComment } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { useState } from "react";

export const Route = createFileRoute("/admin/comments")({
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/sign-in" });
  },
  component: Comments,
});

function Comments() {
  const comments = useAdminComments();
  const moderate = useModerateComment();
  const user = getStoredUser();

  return (
    <div className="space-y-6">
      <h1 className="font-serif font-black text-3xl text-navy">Comments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Moderate Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {comments.isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
          {(comments.data ?? []).map((c: { id: string; body: string; status: string; articleId: string; createdAt: string }) => (
            <div key={c.id} className="rounded border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <p className="text-sm">{c.body}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.status} · {new Date(c.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={!user || moderate.isPending} onClick={() => user && moderate.mutate({ id: c.id, status: "approved", userId: user.id })}>Approve</Button>
                <Button size="sm" variant="destructive" disabled={!user || moderate.isPending} onClick={() => user && moderate.mutate({ id: c.id, status: "rejected", userId: user.id })}>Reject</Button>
              </div>
            </div>
          ))}
          {!comments.isLoading && !(comments.data ?? []).length && (
            <p className="text-muted-foreground text-sm">No comments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
