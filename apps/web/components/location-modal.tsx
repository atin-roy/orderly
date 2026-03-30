"use client";

import { useState } from "react";
import { CloseIcon, LocationPinIcon, SearchIcon } from "./icons";

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
}

export function LocationModal({ open, onClose }: LocationModalProps) {
  const [address, setAddress] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Select your location</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter your delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-sm"
          />
        </div>

        {/* Use current location */}
        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
          <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center">
            <LocationPinIcon className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="text-sm font-medium">Use current location</p>
            <p className="text-xs text-subtle">Enable location access</p>
          </div>
        </button>

        {/* Confirm */}
        {address && (
          <button
            onClick={onClose}
            className="mt-4 w-full bg-brand text-white py-3 rounded-xl font-medium hover:bg-brand/90 transition-colors"
          >
            Confirm Location
          </button>
        )}
      </div>
    </div>
  );
}
