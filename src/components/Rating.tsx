import { Star } from "lucide-react";

export function Rating({ value, reviews }: { value: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="inline-flex items-center gap-1 rounded bg-success px-1.5 py-0.5 text-xs font-semibold text-success-foreground">
        {value.toFixed(1)}
        <Star className="h-3 w-3 fill-current" />
      </span>
      {reviews !== undefined && (
        <span className="text-muted-foreground">({reviews.toLocaleString("en-IN")})</span>
      )}
    </div>
  );
}
