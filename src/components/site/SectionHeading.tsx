import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function SectionHeading({ title, href, label = "See all" }: { title: string; href?: string; label?: string }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <h2 className="section-rule text-2xl">{title}</h2>
      {href && (
        <Link to={href} className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 inline-flex items-center gap-1">
          {label} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
