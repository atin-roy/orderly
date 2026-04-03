"use client";

import type { ChangeEvent } from "react";
import { useEffect, useId, useState } from "react";
import { resolveAssetUrl, uploadImage } from "@/lib/api";

interface ImageUploadFieldProps {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  helperText?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  helperText,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState(Boolean(value));

  useEffect(() => {
    setUploaded(Boolean(value));
  }, [value]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const response = await uploadImage(file);
      onChange(response.data.url);
      setUploaded(true);
    } catch (uploadError) {
      setUploaded(false);
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50/50 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="h-28 w-full overflow-hidden rounded-2xl border border-orange-100 bg-white md:w-36">
          {value ? (
            <img src={resolveAssetUrl(value)} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-xs text-subtle">
              No image uploaded
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="block text-sm font-semibold text-foreground">
            {label}
          </label>
          {helperText ? <p className="mt-1 text-xs text-subtle">{helperText}</p> : null}
          {value ? <p className="mt-2 break-all text-xs text-subtle">{value}</p> : null}
          <label
            htmlFor={inputId}
            className={`mt-4 inline-flex cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-white ${
              uploading ? "bg-brand/80" : uploaded ? "bg-emerald-600" : "bg-brand"
            }`}
          >
            {uploading ? "Uploading..." : uploaded ? "Image uploaded" : "Upload image"}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="sr-only"
          />
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
