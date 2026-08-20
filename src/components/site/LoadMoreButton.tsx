import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
  hasMore: boolean;
  label?: string;
  loadingLabel?: string;
}

export function LoadMoreButton({
  onClick,
  loading = false,
  hasMore,
  label = "Load More",
  loadingLabel = "Loading…",
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="bg-navy text-white font-bold uppercase text-xs tracking-wider px-5 py-2.5 rounded hover:bg-navy/90 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 transition"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {loading ? loadingLabel : label}
      </button>
    </div>
  );
}
