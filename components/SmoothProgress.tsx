import { cn } from "@/lib/utils";

interface SmoothProgressProps {
  value: number;
  className?: string;
}

export function SmoothProgress({ value, className }: SmoothProgressProps) {
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className,
      )}
    >
      <div
        className="h-full bg-primary will-change-transform"
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
          transform: "translateZ(0)",
        }}
      />
    </div>
  );
}
