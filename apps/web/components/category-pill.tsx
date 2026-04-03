import type { ReactNode } from "react";

interface CategoryPillProps {
  icon: ReactNode;
  label: string;
  color?: string;
}

export function CategoryPill({ icon, label, color = "text-brand" }: CategoryPillProps) {
  return (
    <button className="flex flex-col items-center gap-2 group cursor-pointer">
      <div
        className={`w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center ${color} group-hover:border-brand group-hover:shadow-md transition-all`}
      >
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-brand transition-colors">
        {label}
      </span>
    </button>
  );
}
