"use client";

import type { AdminDeliveryPartner } from "@orderly/types";
import { useEffect, useState } from "react";
import { AdminPagination } from "@/components/admin-pagination";
import {
  createAdminDeliveryPartner,
  deleteAdminDeliveryPartner,
  getAdminDeliveryPartners,
  updateAdminDeliveryPartner,
} from "@/lib/api";

const PAGE_SIZE = 10;
const adminActionButtonClass =
  "rounded-full border px-4 py-2 text-sm font-semibold transition duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30";
const adminActionButtonBrandClass =
  `${adminActionButtonClass} border-orange-200 bg-white text-brand hover:border-orange-300 hover:bg-orange-50 active:border-orange-400 active:bg-orange-100`;
const adminActionButtonDangerClass =
  `${adminActionButtonClass} border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50 active:border-red-400 active:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:border-red-200 disabled:hover:bg-white`;

const emptyPartnerForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  city: "Kolkata",
  vehicleType: "Bike",
  preferredShift: "Lunch peak",
  serviceZones: "",
  deliveryExperience: "",
};

function validatePartnerForm(
  form: typeof emptyPartnerForm,
  requirePassword: boolean
) {
  if (!form.fullName.trim()) {
    return "Full name is required.";
  }
  if (!form.email.trim()) {
    return "Email is required.";
  }
  if (requirePassword && !form.password.trim()) {
    return "Password is required.";
  }
  if (requirePassword && form.password.trim().length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!form.phone.trim()) {
    return "Phone is required.";
  }
  if (!form.city.trim()) {
    return "City is required.";
  }
  if (!form.vehicleType.trim()) {
    return "Vehicle type is required.";
  }
  if (!form.preferredShift.trim()) {
    return "Preferred shift is required.";
  }
  if (!form.serviceZones.trim()) {
    return "Service zones are required.";
  }
  if (!form.deliveryExperience.trim()) {
    return "Delivery experience is required.";
  }

  return null;
}

export default function AdminDeliveryPartnersPage() {
  const [partners, setPartners] = useState<AdminDeliveryPartner[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [query, setQuery] = useState("");
  const [shift, setShift] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [editingPartnerId, setEditingPartnerId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState(emptyPartnerForm);

  const activePartners = partners.filter((partner) => partner.activeNow).length;
  const standbyPartners = partners.filter((partner) => !partner.activeNow).length;

  async function refreshPartners(nextPage = page) {
    const response = await getAdminDeliveryPartners({
      page: nextPage,
      size: PAGE_SIZE,
      query: query.trim() || undefined,
      shift: shift || undefined,
    });

    setPartners(response.data.content);
    setTotalPages(response.data.totalPages);
    setTotalElements(response.data.totalElements);
  }

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
      .catch((error) => {
        console.error("Failed to fetch admin delivery partners", error);
        if (!ignore) {
          setPartners([]);
          setTotalPages(1);
          setTotalElements(0);
          setMessage(error instanceof Error ? error.message : "Unable to load delivery partners.");
          setMessageType("error");
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, query, shift]);

  function openCreateModal() {
    setEditingPartnerId(null);
    setPartnerForm(emptyPartnerForm);
    setMessage("");
    setMessageType("success");
    setIsModalOpen(true);
  }

  function openEditModal(partner: AdminDeliveryPartner) {
    setEditingPartnerId(partner.id);
    setPartnerForm({
      fullName: partner.name ?? "",
      email: partner.email,
      password: "",
      phone: partner.phone,
      city: partner.city,
      vehicleType: partner.vehicleType,
      preferredShift: partner.preferredShift,
      serviceZones: partner.serviceZones,
      deliveryExperience: partner.deliveryExperience,
    });
    setMessage("");
    setMessageType("success");
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    const validationError = validatePartnerForm(partnerForm, !editingPartnerId);
    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingPartnerId) {
        await updateAdminDeliveryPartner(editingPartnerId, {
          fullName: partnerForm.fullName.trim(),
          email: partnerForm.email.trim(),
          phone: partnerForm.phone.trim(),
          city: partnerForm.city.trim(),
          vehicleType: partnerForm.vehicleType.trim(),
          preferredShift: partnerForm.preferredShift.trim(),
          serviceZones: partnerForm.serviceZones.trim(),
          deliveryExperience: partnerForm.deliveryExperience.trim(),
        });
        setMessage("Delivery partner updated.");
      } else {
        await createAdminDeliveryPartner({
          fullName: partnerForm.fullName.trim(),
          email: partnerForm.email.trim(),
          password: partnerForm.password.trim(),
          phone: partnerForm.phone.trim(),
          city: partnerForm.city.trim(),
          vehicleType: partnerForm.vehicleType.trim(),
          preferredShift: partnerForm.preferredShift.trim(),
          serviceZones: partnerForm.serviceZones.trim(),
          deliveryExperience: partnerForm.deliveryExperience.trim(),
        });
        setMessage("Delivery partner created.");
        setPage(0);
      }

      setMessageType("success");
      setIsModalOpen(false);
      setPartnerForm(emptyPartnerForm);
      setEditingPartnerId(null);
      await refreshPartners(editingPartnerId ? page : 0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save delivery partner.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeletePartner(partner: AdminDeliveryPartner) {
    if (
      !window.confirm(
        `Delete ${partner.name ?? "this delivery partner"}? This only works when there is no order history.`
      )
    ) {
      return;
    }

    setActionId(partner.id);
    setMessage("");

    try {
      await deleteAdminDeliveryPartner(partner.id);
      setMessage("Delivery partner deleted.");
      setMessageType("success");
      if (partners.length === 1 && page > 0) {
        setPage(page - 1);
        await refreshPartners(page - 1);
      } else {
        await refreshPartners(page);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete delivery partner.");
      setMessageType("error");
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2.2rem] border border-orange-200 bg-[radial-gradient(circle_at_top_left,rgba(253,186,116,0.24),transparent_26%),linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] px-6 py-7 shadow-[0_24px_80px_rgba(211,91,31,0.10)] sm:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand">
              Delivery partners
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              Dispatch roster and rider management
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-subtle">
              Keep the rider roster usable from one screen. Review assignments, update shift and
              zone coverage, and create or remove partners when operations change.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white"
          >
            Add delivery partner
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.6rem] border border-orange-200 bg-white/85 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              Total riders
            </p>
            <p className="mt-3 font-serif text-4xl font-bold text-foreground">{totalElements}</p>
          </div>
          <div className="rounded-[1.6rem] border border-orange-200 bg-white/85 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              Active on page
            </p>
            <p className="mt-3 font-serif text-4xl font-bold text-foreground">{activePartners}</p>
          </div>
          <div className="rounded-[1.6rem] border border-orange-200 bg-white/85 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              Standby on page
            </p>
            <p className="mt-3 font-serif text-4xl font-bold text-foreground">{standbyPartners}</p>
          </div>
        </div>
      </section>

      {message ? (
        <div
          className={`rounded-[1.5rem] px-4 py-3 text-sm ${
            messageType === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-orange-200 bg-orange-50 text-brand"
          }`}
        >
          {message}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
              Rider list
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Delivery team</h2>
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
              tabIndex={0}
              className="group rounded-[1.7rem] border border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.9),#fff)] p-5 outline-none transition focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-brand/20"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-semibold text-foreground">
                      {partner.name ?? "Unnamed partner"}
                    </h3>
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
                  <p className="mt-2 text-sm text-subtle">{partner.phone}</p>
                  <p className="mt-1 text-sm text-subtle">{partner.email}</p>
                  <p className="mt-1 text-sm text-subtle">{partner.city}</p>
                </div>

                <div className="flex flex-wrap gap-2 opacity-0 transition duration-150 ease-out pointer-events-none translate-y-2 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus:pointer-events-auto group-focus:translate-y-0 group-focus:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => openEditModal(partner)}
                    className={adminActionButtonBrandClass}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeletePartner(partner)}
                    disabled={actionId === partner.id}
                    className={adminActionButtonDangerClass}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                    Vehicle
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{partner.vehicleType}</p>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                    Preferred shift
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{partner.preferredShift}</p>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                    Live orders
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{partner.activeOrders}</p>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
                    Experience
                  </p>
                  <p className="mt-2 text-sm leading-6 text-subtle">{partner.deliveryExperience}</p>
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
              No delivery partners match the current filters. Use the add button to create a rider
              profile and start managing the roster from here.
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

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[calc(100vh-4rem)] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-orange-200 bg-white p-6 shadow-[0_30px_120px_rgba(0,0,0,0.18)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
                  {editingPartnerId ? "Edit delivery partner" : "Create delivery partner"}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold">
                  {editingPartnerId ? "Rider profile controls" : "New rider profile"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
              >
                Close
              </button>
            </div>

            <form
              className="mt-8 space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Full name", "fullName"],
                  ["Email", "email"],
                  ["Phone", "phone"],
                  ["City", "city"],
                ].map(([label, key]) => (
                  <label key={key} className="block text-sm">
                    <span className="mb-2 block font-semibold text-foreground">{label}</span>
                    <input
                      value={partnerForm[key as keyof typeof partnerForm] as string}
                      onChange={(event) =>
                        setPartnerForm((current) => ({ ...current, [key]: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                    />
                  </label>
                ))}

                {!editingPartnerId ? (
                  <label className="block text-sm md:col-span-2">
                    <span className="mb-2 block font-semibold text-foreground">Password</span>
                    <input
                      type="password"
                      value={partnerForm.password}
                      onChange={(event) =>
                        setPartnerForm((current) => ({ ...current, password: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                    />
                  </label>
                ) : null}

                <label className="block text-sm">
                  <span className="mb-2 block font-semibold text-foreground">Vehicle type</span>
                  <select
                    value={partnerForm.vehicleType}
                    onChange={(event) =>
                      setPartnerForm((current) => ({ ...current, vehicleType: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3"
                  >
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-2 block font-semibold text-foreground">Preferred shift</span>
                  <select
                    value={partnerForm.preferredShift}
                    onChange={(event) =>
                      setPartnerForm((current) => ({
                        ...current,
                        preferredShift: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3"
                  >
                    <option value="Morning rush">Morning rush</option>
                    <option value="Lunch peak">Lunch peak</option>
                    <option value="Evening">Evening</option>
                    <option value="Night shift">Night shift</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-foreground">Service zones</span>
                <textarea
                  value={partnerForm.serviceZones}
                  onChange={(event) =>
                    setPartnerForm((current) => ({ ...current, serviceZones: event.target.value }))
                  }
                  className="min-h-28 w-full rounded-2xl border border-orange-200 px-4 py-3"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-foreground">Delivery experience</span>
                <textarea
                  value={partnerForm.deliveryExperience}
                  onChange={(event) =>
                    setPartnerForm((current) => ({
                      ...current,
                      deliveryExperience: event.target.value,
                    }))
                  }
                  className="min-h-28 w-full rounded-2xl border border-orange-200 px-4 py-3"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-orange-200 px-6 py-4 text-sm font-semibold text-brand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? editingPartnerId
                      ? "Saving..."
                      : "Creating..."
                    : editingPartnerId
                      ? "Save partner"
                      : "Create partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
