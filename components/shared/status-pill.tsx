import { cn } from "@/lib/utils";

type StatusPillVariant = "new" | "pending" | "sent" | "confirmed" | "refuse" | "suspended";

type StatusPillProps = {
  variant: StatusPillVariant;
  label: string;
  className?: string;
};

export function StatusPill({ variant, label, className }: StatusPillProps) {
  const variantStyles = {
    new: "bg-henna/10 text-henna",
    pending: "bg-goldSoft/20 text-goldSoft",
    sent: "bg-goldSoft/20 text-goldSoft",
    confirmed: "bg-sage/20 text-sage",
    refuse: "bg-destructive/10 text-destructive",
    suspended: "bg-neutral-700/10 text-neutral-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
