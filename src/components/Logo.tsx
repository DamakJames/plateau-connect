import { cn } from "@/lib/utils";
import emblem from "@/assets/plato-emblem.png";

export function Logo({
  className,
  size = "md",
  showWordmark = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
}) {
  const emblemSizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  } as const;
  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl",
    xl: "text-5xl",
  } as const;
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src={emblem}
        alt="PLATO emblem"
        width={96}
        height={96}
        className={cn("object-contain drop-shadow-sm", emblemSizes[size])}
      />
      {showWordmark && (
        <span
          className={cn(
            "bg-gradient-to-r from-[var(--clay)] via-primary to-[var(--ochre)] bg-clip-text font-serif font-black tracking-tight text-transparent",
            textSizes[size],
          )}
        >
          PLATO
        </span>
      )}
    </div>
  );
}
