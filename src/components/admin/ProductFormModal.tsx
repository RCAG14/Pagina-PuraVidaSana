"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Product } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store/useStore";
import {
  getAllCategories,
  MAX_CATEGORY_LENGTH,
  normalizeCategory,
} from "@/lib/categories";
import { normalizeImageUrl } from "@/lib/imageUrl";

const NEW_CATEGORY = "__nueva__";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  product?: Product;
}

const empty = {
  name: "",
  category: "Suplementos" as Category,
  description: "",
  image: "",
  featured: false,
  tags: "",
  benefits: "",
  images: "",
};

export function ProductFormModal({
  open,
  onClose,
  mode,
  product,
}: ProductFormModalProps) {
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const products = useStore((s) => s.products);
  const categories = useMemo(() => getAllCategories(products), [products]);
  const [form, setForm] = useState(empty);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && product) {
      setForm({
        name: product.name,
        category: product.category,
        description: product.description,
        image: product.image,
        featured: !!product.featured,
        tags: (product.tags ?? []).join(", "),
        benefits: (product.benefits ?? []).join("\n"),
        images: (product.images ?? []).join(", "),
      });
    } else if (open && mode === "create") {
      setForm(empty);
    }
    setCreatingCategory(false);
    setNewCategory("");
    setUploadError(null);
    setSubmitError(null);
  }, [mode, product, open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "No se pudo subir la imagen.");
      }
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const image = normalizeImageUrl(form.image);
    if (!form.name.trim()) return;
    if (!image) {
      setSubmitError("Agrega una imagen principal (archivo o URL).");
      return;
    }

    let category: Category = form.category;
    if (creatingCategory) {
      const clean = normalizeCategory(newCategory);
      if (!clean) {
        setSubmitError("Escribe un nombre válido para la nueva categoría.");
        return;
      }
      // Reutiliza una categoría existente si coincide sin importar mayúsculas
      category =
        categories.find((c) => c.toLowerCase() === clean.toLowerCase()) ??
        clean;
    }

    const payload = {
      name: form.name,
      category,
      price: product?.price ?? 0,
      stock: product?.stock ?? 1,
      description: form.description,
      image,
      featured: form.featured,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      benefits: form.benefits
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
      images: form.images
        .split(",")
        .map(normalizeImageUrl)
        .filter(Boolean),
    };

    setSubmitting(true);
    setSubmitError(null);

    const result =
      mode === "create"
        ? await addProduct(payload)
        : product
          ? await updateProduct(product.id, payload)
          : { ok: false, message: "Producto no encontrado." };

    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message ?? "No se pudo guardar el producto.");
      return;
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Agregar nuevo producto" : "Editar producto"}
      size="lg"
      variant="solid"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
              Nombre
            </span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej. Omega-3 Aceite de Pescado"
              className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
              Categoría
            </span>
            <select
              value={creatingCategory ? NEW_CATEGORY : form.category}
              onChange={(e) => {
                if (e.target.value === NEW_CATEGORY) {
                  setCreatingCategory(true);
                  return;
                }
                setCreatingCategory(false);
                setForm((f) => ({
                  ...f,
                  category: e.target.value as Category,
                }));
              }}
              className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={NEW_CATEGORY}>+ Nueva categoría...</option>
            </select>
            {creatingCategory && (
              <input
                autoFocus
                required
                value={newCategory}
                maxLength={MAX_CATEGORY_LENGTH}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nombre de la nueva categoría"
                className="mt-2 w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
              />
            )}
          </label>

          <div className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
              Imagen principal
            </span>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              {form.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image}
                  alt=""
                  className="h-40 w-40 shrink-0 rounded-xl border border-forest/10 object-cover"
                />
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-leaf/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-forest focus:border-leaf"
                />
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image: e.target.value }))
                  }
                  onBlur={() =>
                    setForm((f) => ({ ...f, image: normalizeImageUrl(f.image) }))
                  }
                  disabled={uploading}
                  placeholder="O pega una URL (ej. enlace de Google Drive)"
                  className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-ink/50">
              Sube un archivo desde tu equipo o pega una URL. En Google Drive,
              comparte la imagen como &quot;Cualquier persona con el enlace&quot;.
            </p>
            {uploading && (
              <p className="mt-1 text-xs text-ink/50">Subiendo imagen...</p>
            )}
            {uploadError && (
              <p className="mt-1 text-xs text-red-600">{uploadError}</p>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
              Etiquetas (separadas por coma)
            </span>
            <input
              value={form.tags}
              onChange={(e) =>
                setForm((f) => ({ ...f, tags: e.target.value }))
              }
              placeholder="Vegano, Sin gluten"
              className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
            />
          </label>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, featured: e.target.checked }))
              }
              className="h-4 w-4 accent-leaf"
            />
            <span className="text-sm text-forest">
              Producto destacado (aparece en Home con insignia dorada)
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
              Imágenes adicionales (URLs, separadas por coma)
            </span>
            <input
              value={form.images}
              onChange={(e) =>
                setForm((f) => ({ ...f, images: e.target.value }))
              }
              placeholder="https://ejemplo.com/foto2.jpg, https://ejemplo.com/foto3.jpg"
              className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
              Beneficios (uno por línea)
            </span>
            <textarea
              rows={3}
              value={form.benefits}
              onChange={(e) =>
                setForm((f) => ({ ...f, benefits: e.target.value }))
              }
              placeholder={"Apoya la salud cardiovascular\nFavorece la función cognitiva"}
              className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
              Descripción
            </span>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Describe el producto: para qué sirve, presentación, ingredientes destacados..."
              className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-soft pt-4">
          {submitError && (
            <p className="mr-auto text-sm text-red-600">{submitError}</p>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={submitting || uploading}
          >
            {submitting
              ? "Guardando..."
              : mode === "create"
                ? "Crear producto"
                : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
