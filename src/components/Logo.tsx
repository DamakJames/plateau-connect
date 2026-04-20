import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
    xl: "text-7xl",
  } as const;
  return (
    <span className={cn("font-serif font-black tracking-tight text-primary", sizes[size], className)}>
      PLATO
    </span>
  );
}
