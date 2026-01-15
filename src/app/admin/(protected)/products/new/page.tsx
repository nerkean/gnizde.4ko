"use client";

import { useState } from "react";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const base64 = await toBase64(file);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: base64, fileName: file.name }),
    });
    const data = await res.json();

    if (data.ok) setImage(data.url);
    setUploading(false);
  }

  function toBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="space-y-6">

      {/* Форма создания товара */}
      <ProductForm/>
    </div>
  );
}
