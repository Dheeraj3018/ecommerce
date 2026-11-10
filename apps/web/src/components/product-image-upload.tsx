"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { attachProductImage } from "@/app/admin/actions";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function ProductImageUpload({ productId, currentUrl }: { productId: string; currentUrl: string | null }) {
  const [preview, setPreview] = useState(currentUrl);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = allowedTypes[file.type];
    if (!extension || file.size > 3 * 1024 * 1024 || file.size === 0) {
      setMessage("Choose a JPG, PNG or WebP image smaller than 3 MB.");
      event.target.value = "";
      return;
    }
    setWorking(true);
    setMessage("");
    const db = createClient();
    const path = productId + "/" + crypto.randomUUID() + "." + extension;
    try {
      const { error } = await db.storage.from("product-images").upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      await attachProductImage(productId, path);
      setPreview(db.storage.from("product-images").getPublicUrl(path).data.publicUrl);
      setMessage("Product image saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setWorking(false);
      event.target.value = "";
    }
  }
  return <div className="mt-5 grid gap-5 sm:grid-cols-[160px_1fr] sm:items-center">
    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-emerald-50">
      {preview ? <Image src={preview} alt="Product preview" width={160} height={160} unoptimized className="h-full w-full object-cover"/> : <span className="text-5xl" aria-hidden="true">📷</span>}
    </div>
    <div><label className="block text-sm font-medium" htmlFor="product-photo">Upload product photo</label>
      <input id="product-photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={working} onChange={upload} className="mt-2 block w-full max-w-sm text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-800 file:px-4 file:py-2 file:text-white"/>
      <p className="mt-2 text-xs text-zinc-600">JPG, PNG or WebP, up to 3 MB. Uploaded photos are publicly viewable when the product is published.</p>
      {message && <p role="status" className="mt-3 text-sm text-emerald-900">{message}</p>}
      {working && <p role="status" className="mt-2 text-sm">Uploading image…</p>}
    </div>
  </div>;
}
