"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import {
  createUserAddress,
  getRestaurantLocalities,
  setDefaultUserAddress,
} from "@/lib/api";
import { CloseIcon, LocationPinIcon, SearchIcon } from "./icons";

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
}

const inputClassName =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export function LocationModal({ open, onClose }: LocationModalProps) {
  const { profile, refreshProfile } = useSession();
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState("");
  const [buildingInfo, setBuildingInfo] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [isDefault, setIsDefault] = useState(true);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [localities, setLocalities] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLabel("Home");
    setAddress("");
    setBuildingInfo("");
    setCity("");
    setPhone(profile?.phone ?? "");
    setCoordinates(null);
    setError("");
    setIsDefault((profile?.addresses.length ?? 0) === 0);
  }, [open, profile?.addresses.length, profile?.phone]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void getRestaurantLocalities()
      .then((response) => setLocalities(response.data))
      .catch(() => setLocalities([]));
  }, [open]);

  if (!open) return null;

  async function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setError("This browser does not support location access.");
      return;
    }

    setError("");
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        setLocating(false);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const resolved =
            data.address?.city ?? data.address?.town ?? data.address?.village ?? "";
          if (resolved) setCity(resolved);

          if (data.display_name) {
            setAddress(data.display_name);
          }
        } catch {
          // Reverse geocoding failed silently — user can fill fields manually
        }
      },
      () => {
        setLocating(false);
        setError("Unable to read your current location. Enter the address manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSelectSavedAddress(addressId: number) {
    setError("");
    setLoading(true);

    try {
      await setDefaultUserAddress(addressId);
      await refreshProfile();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update delivery location.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmLocation() {
    setError("");

    if (!label.trim() || !address.trim() || !city.trim()) {
      setError("Enter a label, address, and city.");
      return;
    }

    setLoading(true);

    try {
      if (!phone.trim()) {
        throw new Error("Phone is required to save a delivery address.");
      }

      await createUserAddress({
        label: label.trim(),
        address: address.trim(),
        buildingInfo: buildingInfo.trim() || undefined,
        city: city.trim(),
        phone: phone.trim(),
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
        isDefault,
      });
      await refreshProfile();

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save location.");
    } finally {
      setLoading(false);
    }
  }

  const savedAddresses = profile?.addresses ?? [];

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative flex min-h-full items-start justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:max-h-[calc(100vh-5rem)] sm:overflow-y-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Select your location</h2>
            <p className="mt-1 text-sm text-subtle">
              Choose a saved address or add a new delivery address for customer flows.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {savedAddresses.length > 0 ? (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
              Saved addresses
            </p>
            <div className="mt-3 grid gap-3">
              {savedAddresses.map((savedAddress) => (
                <button
                  key={savedAddress.id}
                  type="button"
                  onClick={() => handleSelectSavedAddress(savedAddress.id)}
                  disabled={loading}
                  className={`rounded-2xl border p-4 text-left transition ${
                    savedAddress.isDefault
                      ? "border-brand bg-orange-50"
                      : "border-orange-100 hover:border-orange-200 hover:bg-orange-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{savedAddress.label}</p>
                      <p className="mt-1 text-sm text-subtle">
                        {savedAddress.address}
                        {savedAddress.city ? `, ${savedAddress.city}` : ""}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                      {savedAddress.isDefault ? "Active" : "Deliver here"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/40 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                Add address
              </p>
              <p className="mt-2 text-sm text-subtle">
                {coordinates
                  ? `Coordinates captured: ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
                  : "Enter the address manually or use your current location to prefill it."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleUseCurrentLocation()}
              disabled={locating}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-brand transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LocationPinIcon className="h-4 w-4" />
              {locating ? "Locating..." : "Use current location"}
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="locationLabel">
                Label
              </label>
              <input
                id="locationLabel"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                className={inputClassName}
                placeholder="Home"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="locationCity">
                City
              </label>
              <input
                id="locationCity"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className={inputClassName}
                placeholder="Bengaluru"
              />
            </div>
          </div>

          <div className="relative mt-4">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter your delivery address or Kolkata locality"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className={`${inputClassName} pl-10`}
            />
          </div>

          {localities.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                Suggested localities
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {localities.slice(0, 10).map((locality) => (
                  <button
                    key={locality}
                    type="button"
                    onClick={() => {
                      setCity("Kolkata");
                      setAddress(locality);
                      if (!buildingInfo) {
                        setBuildingInfo(`Near ${locality}`);
                      }
                    }}
                    className="rounded-full border border-orange-200 bg-white px-3 py-2 text-xs font-semibold tracking-wide text-brand"
                  >
                    {locality}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="buildingInfo">
              Building info
            </label>
            <input
              id="buildingInfo"
              value={buildingInfo}
              onChange={(event) => setBuildingInfo(event.target.value)}
              className={inputClassName}
              placeholder="Flat 804, Palm Residency"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClassName}
              placeholder="+91 98765 43210"
            />
          </div>

          <label className="mt-4 flex items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(event) => setIsDefault(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
            />
            Make this my default delivery address
          </label>

          <button
            type="button"
            onClick={() => void handleConfirmLocation()}
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-brand py-3 font-medium text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save address"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
