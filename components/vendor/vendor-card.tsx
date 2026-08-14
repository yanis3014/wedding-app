import { Heart, MapPin, Star } from "lucide-react";

import { cn } from "@/lib/utils";

type VendorCardProps = {
  vendor: {
    id: string;
    name: string;
    category: string;
    location: string;
    rating: number;
    reviewCount: number;
    price: string | number;
  };
  className?: string;
};

export function VendorCard({ vendor, className }: VendorCardProps) {
  const priceDisplay = typeof vendor.price === "number"
    ? vendor.price.toLocaleString("fr-FR")
    : vendor.price;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[14px] border border-black/10 bg-card",
        className,
      )}
    >
      <div className="relative h-[140px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose to-goldSoft" />

        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-ink">
          {vendor.category}
        </span>

        <button
          type="button"
          aria-label="Ajouter aux favoris"
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/95 text-ink-muted transition-colors hover:text-henna"
        >
          <Heart className="size-4" />
        </button>
      </div>

      <div className="space-y-1 p-4">
        <p className="text-[11px] font-medium uppercase tracking-widest text-henna">
          {vendor.category}
        </p>

        <h3 className="font-heading text-lg font-medium leading-snug text-ink">
          {vendor.name}
        </h3>

        <div className="flex items-center gap-2 pt-1 text-sm text-ink-muted">
          <p className="flex min-w-0 items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{vendor.location}</span>
          </p>
          <span className="shrink-0 font-medium text-ink">
            dès {priceDisplay} DT
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-1 text-ink">
            <Star className="size-3.5 fill-goldSoft text-goldSoft" />
            <span className="font-medium">{vendor.rating.toFixed(1)}</span>
            <span className="text-ink-muted">({vendor.reviewCount})</span>
          </div>
        </div>
      </div>
    </article>
  );
}
