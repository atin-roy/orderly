import Link from "next/link";
import { resolveAssetUrl } from "@/lib/api";
import { StarIcon } from "./icons";

interface RestaurantCardProps {
  href?: string;
  name: string;
  cuisine: string;
  locality?: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  imageColor: string;
  imageUrl?: string | null;
}

export function RestaurantCard({
  href,
  name,
  cuisine,
  locality,
  rating,
  deliveryTime,
  deliveryFee,
  imageColor,
  imageUrl,
}: RestaurantCardProps) {
  const content = (
    <div className="group cursor-pointer">
      <div className="relative rounded-xl overflow-hidden mb-3">
        {imageUrl ? (
          <img
            src={resolveAssetUrl(imageUrl)}
            alt={`${name} restaurant`}
            className="w-full aspect-[4/3] object-cover"
          />
        ) : (
          <div
            className={`w-full aspect-[4/3] ${imageColor}`}
            aria-label={`${name} restaurant image`}
          />
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
          <StarIcon className="w-3.5 h-3.5 text-brand" />
          <span className="text-sm font-semibold">{rating}</span>
        </div>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg group-hover:text-brand transition-colors">
            {name}
          </h3>
          <p className="text-subtle text-sm">
            {cuisine} &middot; {deliveryTime}
          </p>
          {locality ? <p className="text-subtle text-sm">{locality}</p> : null}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{deliveryFee}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
