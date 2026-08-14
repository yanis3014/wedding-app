"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  };

  const handleMouseEnter = (starNumber: number) => {
    if (!readonly) {
      setHoverRating(starNumber);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const handleClick = (starNumber: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starNumber);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={cn("flex gap-1", className)}>
      {[1, 2, 3, 4, 5].map((starNumber) => (
        readonly ? (
          <div key={starNumber}>
            <Star
              className={cn(
                sizeClasses[size],
                starNumber <= displayRating
                  ? "fill-goldSoft text-goldSoft"
                  : "text-ink-muted/30"
              )}
            />
          </div>
        ) : (
          <button
            key={starNumber}
            type="button"
            onMouseEnter={() => handleMouseEnter(starNumber)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starNumber)}
            className="cursor-pointer transition-colors hover:scale-110"
          >
            <Star
              className={cn(
                sizeClasses[size],
                starNumber <= displayRating
                  ? "fill-goldSoft text-goldSoft"
                  : "text-ink-muted/30"
              )}
            />
          </button>
        )
      ))}
    </div>
  );
}
