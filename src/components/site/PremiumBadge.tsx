import { cn } from "@/lib/utils";

export type PremiumTier = "none" | "subscriber" | "admin";

type Variant = {
  fill: string;
  shape: "scallop" | "cloud" | "star";
  label: string;
};

const VARIANTS: Record<PremiumTier, Variant> = {
  none: { fill: "#8AA0B5", shape: "scallop", label: "Free reader" },
  subscriber: { fill: "#1D9BF0", shape: "cloud", label: "Premium subscriber" },
  admin: { fill: "url(#gold-grad)", shape: "star", label: "The Eagle's Eye Media editor" },
};

const PATHS = {
  scallop:
    "M512 100c25 0 48 9 65 25l32 32c18 18 42 28 67 28h45c33 0 60 27 60 60v45c0 25 10 49 28 67l32 32c34 34 34 90 0 124l-32 32c-18 18-28 42-28 67v45c0 33-27 60-60 60h-45c-25 0-49 10-67 28l-32 32c-34 34-90 34-124 0l-32-32c-18-18-42-28-67-28h-45c-33 0-60-27-60-60v-45c0-25-10-49-28-67l-32-32c-34-34-34-90 0-124l32-32c18-18 28-42 28-67v-45c0-33 27-60 60-60h45c25 0 49-10 67-28l32-32c17-16 40-25 65-25z",
  cloud:
    "M512 80c40 0 76 22 95 56 38-3 75 16 92 51 38 4 71 32 80 70 36 14 61 49 61 89 0 26-10 50-27 68 17 18 27 42 27 68 0 40-25 75-61 89-9 38-42 66-80 70-17 35-54 54-92 51-19 34-55 56-95 56s-76-22-95-56c-38 3-75-16-92-51-38-4-71-32-80-70-36-14-61-49-61-89 0-26 10-50 27-68-17-18-27-42-27-68 0-40 25-75 61-89 9-38 42-66 80-70 17-35 54-54 92-51 19-34 55-56 95-56z",
  star:
    "M512 80l50 110 120 18-87 85 20 120-103-56-103 56 20-120-87-85 120-18 50-110z M512 80l50 110 120 18-87 85 20 120-103-56-103 56 20-120-87-85 120-18 50-110z",
};

const CHECK = "M340 510l110 110 230-230";

export function PremiumBadge({
  tier,
  className,
  size = 16,
  title,
}: { tier: PremiumTier; className?: string; size?: number; title?: string }) {
  const v = VARIANTS[tier];
  return (
    <svg
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      className={cn("inline-block align-middle shrink-0", className)}
      aria-label={title ?? v.label}
      role="img"
    >
      <defs>
        <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD56A" />
          <stop offset="50%" stopColor="#F2A900" />
          <stop offset="100%" stopColor="#B07800" />
        </linearGradient>
      </defs>
      <path d={PATHS[v.shape]} fill={v.fill} />
      <path d={CHECK} stroke="#fff" strokeWidth={70} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
