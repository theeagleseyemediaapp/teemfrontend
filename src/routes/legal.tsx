import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [{ title: "Legal Hub — The Eagle's Eye Media" }],
    links: [{ rel: "canonical", href: "/legal" }],
  }),
  component: LegalLayout,
});

function LegalLayout() {
  return (
    <div className="bg-slate-50 min-h-[85vh]">
      <Outlet />
    </div>
  );
}
