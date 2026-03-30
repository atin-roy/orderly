import { StarIcon } from "./icons";

interface RestaurantCardProps {
  name: string;
  cuisine: string;
  rating: number;
  priceLevel: string;
  deliveryTime: string;
  deliveryFee: string;
  imageColor: string;
}

export function RestaurantCard({
  name,
  cuisine,
  rating,
  priceLevel,
  deliveryTime,
  deliveryFee,
  imageColor,
}: RestaurantCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative rounded-xl overflow-hidden mb-3">
        <div
          className={`w-full aspect-[4/3] ${imageColor}`}
          aria-label={`${name} restaurant image`}
        />
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
        </div>
        <div className="text-right">
          <span className="font-semibold text-sm">{priceLevel}</span>
          <p className="text-xs text-subtle">{deliveryFee}</p>
        </div>
      </div>
    </div>
  );
}
