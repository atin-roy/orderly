import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  sideContent: ReactNode;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  sideContent,
  children,
  backHref = "/register",
  backLabel = "All signup paths",
}: AuthShellProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_380px]">
        <section className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-[0_24px_60px_rgba(35,24,21,0.08)] sm:p-10">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-subtle transition hover:text-brand"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {backLabel}
          </Link>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-subtle">
            {description}
          </p>

          <div className="mt-8">{children}</div>
        </section>

        <aside className="flex min-h-full items-center justify-center rounded-[2rem] border border-orange-100 bg-[linear-gradient(180deg,rgba(255,250,240,0.96),rgba(248,223,190,0.92))] p-8 shadow-[0_24px_60px_rgba(211,91,31,0.08)]">
          <div className="w-full max-w-sm text-center">
            {sideContent}
          </div>
        </aside>
      </div>
    </div>
  );
}
