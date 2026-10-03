import type { Category, Product } from "@/types";

export const BASE_CATEGORIES: Category[] = [
  "Suplementos",
  "Vitaminas",
  "Cosmética Natural",
  "Proteínas",
];

export const MAX_CATEGORY_LENGTH = 60;

/** Normaliza el nombre de una categoría; devuelve null si es inválido. */
export function normalizeCategory(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim().replace(/\s+/g, " ");
  if (!clean || clean.length > MAX_CATEGORY_LENGTH) return null;
  return clean;
}

/** Categorías base + las creadas desde administración (presentes en productos). */
export function getAllCategories(products: Pick<Product, "category">[]): Category[] {
  const result = [...BASE_CATEGORIES];
  const seen = new Set(result.map((c) => c.toLowerCase()));
  for (const p of products) {
    const c = normalizeCategory(p.category);
    if (c && !seen.has(c.toLowerCase())) {
      seen.add(c.toLowerCase());
      result.push(c);
    }
  }
  return result;
}
