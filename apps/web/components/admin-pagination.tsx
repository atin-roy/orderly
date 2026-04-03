"use client";

import { ArrowLeftIcon, ChevronRightIcon } from "@/components/icons";

export function AdminPagination({
  page,
  totalPages,
  totalElements,
  label,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  label: string;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.max(totalPages, 1);
  const isFirstPage = page <= 0;
  const isLastPage = page >= pageCount - 1;

  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] border border-orange-200 bg-white/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">{label}</p>
        <p className="mt-1 text-sm text-subtle">
          {totalElements} total
          {` `}
          <span className="font-semibold text-foreground">
            Page {page + 1} of {pageCount}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(page - 1, 0))}
          disabled={isFirstPage}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            isFirstPage
              ? "cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-400"
              : "border border-orange-200 bg-white text-brand hover:border-orange-300 hover:bg-orange-50"
          }`}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(page + 1, pageCount - 1))}
          disabled={isLastPage}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            isLastPage
              ? "cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-400"
              : "border border-orange-200 bg-white text-brand hover:border-orange-300 hover:bg-orange-50"
          }`}
        >
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
