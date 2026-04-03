"use client";

import type { MenuCategory, MenuItem, Restaurant } from "@orderly/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminPagination } from "@/components/admin-pagination";
import { ImageUploadField } from "@/components/image-upload-field";
import { formatRupees } from "@/data/mock-data";
import {
  createMenuItem,
  deleteMenuItem,
  getAdminRestaurant,
  getManagementMenu,
  updateMenuItem,
} from "@/lib/api";

const PAGE_SIZE = 8;

const emptyForm = {
  name: "",
  description: "",
  imageUrl: "",
  price: 199,
  category: "Mains",
  isAvailable: true,
  isVeg: false,
  sortOrder: 1,
};

export default function AdminRestaurantMenuPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params.id);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  async function refreshMenu() {
    const response = await getManagementMenu(restaurantId);
    setMenu(response.data);
  }

  useEffect(() => {
    let ignore = false;

    void Promise.all([getAdminRestaurant(restaurantId), getManagementMenu(restaurantId)])
      .then(([restaurantResponse, menuResponse]) => {
        if (ignore) {
          return;
        }
        setRestaurant(restaurantResponse.data);
        setMenu(menuResponse.data);
      })
      .catch(() => {
        if (!ignore) {
          setRestaurant(null);
          setMenu([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, [restaurantId]);

  async function handleSave() {
    const payload = {
      ...form,
      imageUrl: form.imageUrl || undefined,
    };

    if (editingItemId) {
      await updateMenuItem(restaurantId, editingItemId, payload);
      setMessage("Menu item updated.");
    } else {
      await createMenuItem(restaurantId, payload);
      setMessage("Menu item created.");
    }

    await refreshMenu();
    setEditingItemId(null);
    setForm(emptyForm);
  }

  async function handleDelete(itemId: number) {
    await deleteMenuItem(restaurantId, itemId);
    await refreshMenu();
    setEditingItemId(null);
    setForm(emptyForm);
    setMessage("Menu item deleted.");
  }

  const allItems = menu.flatMap((category) => category.items);
  const filteredItems = allItems.filter((item) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }
    return (
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery)
    );
  });
  const totalPages = Math.max(Math.ceil(filteredItems.length / PAGE_SIZE), 1);
  const currentItems = filteredItems.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <main className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-[2rem] border border-orange-200 bg-white/90 p-5 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
          Menu management
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">{restaurant?.name ?? "Restaurant"}</h1>
        <p className="mt-3 text-sm text-subtle">
          {restaurant ? `${restaurant.locality}, ${restaurant.city}` : "Loading restaurant..."}
        </p>
        <Link
          href="/admin/restaurants"
          className="mt-5 inline-flex rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
        >
          Back to restaurants
        </Link>

        <div className="mt-6 rounded-[1.5rem] border border-orange-100 bg-orange-50/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
            Page totals
          </p>
          <p className="mt-2 text-sm text-subtle">{filteredItems.length} visible menu items</p>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
                Menu editor
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold">
                {editingItemId ? "Edit menu item" : "Add menu item"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingItemId(null);
                setForm(emptyForm);
                setMessage("");
              }}
              className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-brand"
            >
              New item
            </button>
          </div>

          {message ? (
            <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-brand">
              {message}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Name", "name"],
              ["Category", "category"],
            ].map(([label, key]) => (
              <label key={key} className="block text-sm">
                <span className="mb-2 block font-semibold text-foreground">{label}</span>
                <input
                  value={form[key as keyof typeof form] as string}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-orange-200 px-4 py-3"
                />
              </label>
            ))}
          </div>

          <label className="mt-4 block text-sm">
            <span className="mb-2 block font-semibold text-foreground">Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-28 w-full rounded-2xl border border-orange-200 px-4 py-3"
            />
          </label>

          <div className="mt-4">
            <ImageUploadField
              label="Menu image"
              value={form.imageUrl}
              helperText="Upload JPG, PNG, or WebP for the dish card."
              onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-foreground">Price</span>
              <input
                type="number"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({ ...current, price: Number(event.target.value) }))
                }
                className="w-full rounded-2xl border border-orange-200 px-4 py-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-foreground">Sort order</span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
                }
                className="w-full rounded-2xl border border-orange-200 px-4 py-3"
              />
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-orange-100 px-4 py-3 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={form.isVeg}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isVeg: event.target.checked }))
                }
              />
              Veg
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-orange-100 px-4 py-3 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isAvailable: event.target.checked }))
                }
              />
              Available
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              className="rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white"
            >
              {editingItemId ? "Save changes" : "Create item"}
            </button>
            {editingItemId ? (
              <button
                type="button"
                onClick={() => void handleDelete(editingItemId)}
                className="rounded-2xl border border-red-200 px-6 py-4 text-sm font-semibold text-red-700"
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-orange-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(211,91,31,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
                Current menu
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold">Paginated item list</h2>
            </div>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Search dishes or categories"
              className="h-12 rounded-[1.1rem] border border-orange-200 bg-white px-4 text-sm lg:w-80"
            />
          </div>

          <div className="mt-6 grid gap-3">
            {currentItems.map((item: MenuItem) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setEditingItemId(item.id);
                  setForm({
                    name: item.name,
                    description: item.description,
                    imageUrl: item.imageUrl ?? "",
                    price: item.price,
                    category: item.category,
                    isAvailable: item.isAvailable,
                    isVeg: item.isVeg,
                    sortOrder: item.sortOrder,
                  });
                }}
                className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.86),#fff)] px-4 py-4 text-left"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="mt-1 text-sm text-subtle">
                    {item.category} · {formatRupees(item.price)} · {item.isVeg ? "Veg" : "Non-veg"}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                    {item.isAvailable ? "Visible to users" : "Hidden from users"}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                  Edit
                </span>
              </button>
            ))}
            {currentItems.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-subtle">
                No menu items match the current search.
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalElements={filteredItems.length}
              label="Menu item pages"
              onPageChange={setPage}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
