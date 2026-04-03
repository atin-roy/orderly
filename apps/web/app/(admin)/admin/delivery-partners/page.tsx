"use client";

import type { AdminDeliveryPartner } from "@orderly/types";
import { useEffect, useState } from "react";
import { AdminPagination } from "@/components/admin-pagination";
import { getAdminDeliveryPartners } from "@/lib/api";

const PAGE_SIZE = 10;

export default function AdminDeliveryPartnersPage() {
  const [partners, setPartners] = useState<AdminDeliveryPartner[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [query, setQuery] = useState("");
  const [shift, setShift] = useState("");

  useEffect(() => {
    let ignore = false;

    void getAdminDeliveryPartners({
      page,
      size: PAGE_SIZE,
      query: query.trim() || undefined,
      shift: shift || undefined,
    })
      .then((response) => {
        if (ignore) {
          return;
        }
        setPartners(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      })
      .catch(() => {
        if (!ignore) {
          setPartners([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, query, shift]);

  return (
    <main className="space-y-6">
      <section className="rounded-[2.2rem] border border-orange-200 bg-[radial-gradient(circle_at_top_left,rgba(253,186,116,0.24),transparent_26%),linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] px-6 py-7 shadow-[0_24px_80px_rgba(211,91,31,0.10)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand">
          Delivery partners
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
          Dispatch roster with live assignment visibility
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-subtle">
          Review who is currently active, what zones they cover, and how many live orders each
          rider is carrying.
        </p>
      </section>

      <section className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
              Rider list
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Active and standby partners</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_180px]">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Search name, zone, vehicle"
              className="h-12 rounded-[1.1rem] border border-orange-200 bg-white px-4 text-sm"
            />
            <select
              value={shift}
              onChange={(event) => {
                setShift(event.target.value);
                setPage(0);
              }}
              className="h-12 rounded-[1.1rem] border border-orange-200 bg-white px-4 text-sm"
            >
              <option value="">All shifts</option>
              <option value="Morning rush">Morning rush</option>
              <option value="Lunch peak">Lunch peak</option>
              <option value="Evening">Evening</option>
              <option value="Night shift">Night shift</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {partners.map((partner) => (
            <article
              key={partner.id}
              className="rounded-[1.7rem] border border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.9),#fff)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
                    {partner.vehicleType}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">
                    {partner.name ?? "Unnamed partner"}
                  </h3>
                  <p className="mt-2 text-sm text-subtle">{partner.phone}</p>
                  <p className="mt-1 text-sm text-subtle">{partner.email}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    partner.activeNow
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {partner.activeNow ? "On route" : "Standby"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                    Shift
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{partner.preferredShift}</p>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                    Live orders
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{partner.activeOrders}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-orange-100 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                  Service zones
                </p>
                <p className="mt-2 text-sm leading-6 text-subtle">{partner.serviceZones}</p>
              </div>
            </article>
          ))}
          {partners.length === 0 ? (
            <div className="rounded-[1.7rem] border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-subtle">
              No delivery partners match the current filters.
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            label="Delivery partner pages"
            onPageChange={setPage}
          />
        </div>
      </section>
    </main>
  );
}
