"use client";

import { useRef } from "react";
import toast from "react-hot-toast";
import { ImagePlus, X } from "lucide-react";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Client-side image manager: a primary image plus a gallery.
 * Stores images as data URLs (persisted in the store) — no backend required.
 */
export function ImageUpload({
  image,
  images,
  onChange,
}: {
  image: string;
  images: string[];
  onChange: (image: string, images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} exceeds 2MB`);
        continue;
      }
      accepted.push(await readAsDataURL(file));
    }
    if (accepted.length === 0) return;
    const all = [...(image ? [image] : []), ...images, ...accepted];
    onChange(all[0], all.slice(1));
  };

  const removeAt = (index: number) => {
    const all = [...(image ? [image] : []), ...images];
    all.splice(index, 1);
    onChange(all[0] ?? "", all.slice(1));
  };

  const makePrimary = (index: number) => {
    const all = [...(image ? [image] : []), ...images];
    const [picked] = all.splice(index, 1);
    onChange(picked, all);
  };

  const gallery = [...(image ? [image] : []), ...images];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Product Images</label>
      <div className="flex flex-wrap gap-2">
        {gallery.map((src, i) => (
          <div
            key={i}
            className="group relative h-16 w-16 overflow-hidden rounded-lg border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-0 top-0 rounded-br bg-coffee-gradient px-1 text-[8px] font-medium text-cream">
                Main
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-espresso-dark/50 opacity-0 transition-opacity group-hover:opacity-100">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => makePrimary(i)}
                  className="rounded bg-cream/90 px-1 text-[8px] font-medium text-espresso"
                >
                  Set Main
                </button>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="flex h-5 w-5 items-center justify-center rounded bg-danger text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-caramel hover:text-caramel-dark"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-[9px]">Upload</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="text-[11px] text-muted-foreground">
        PNG or JPG up to 2MB. The first image is used as the main photo.
      </p>
    </div>
  );
}
