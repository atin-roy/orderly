import type { ReactNode } from "react";

interface CategoryPillProps {
  icon: ReactNode;
  label: string;
  color?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function CategoryPill({
  icon,
  label,
  color = "text-brand",
  onClick,
  isActive = false,
}: CategoryPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className="group flex flex-col items-center gap-2 cursor-pointer"
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all ${
          isActive
            ? "border-brand bg-orange-50 shadow-md"
            : "border-gray-200 bg-white group-hover:border-brand group-hover:shadow-md"
        } ${color}`}
      >
        {icon}
      </div>
      <span
        className={`text-sm font-medium transition-colors ${
          isActive ? "text-brand" : "text-gray-700 group-hover:text-brand"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
