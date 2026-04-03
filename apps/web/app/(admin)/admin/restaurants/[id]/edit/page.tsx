"use client";

import { useParams } from "next/navigation";
import { AdminRestaurantForm } from "@/components/admin-restaurant-form";

export default function AdminEditRestaurantPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params.id);

  if (!Number.isFinite(restaurantId)) {
    return null;
  }

  return <AdminRestaurantForm restaurantId={restaurantId} />;
}
