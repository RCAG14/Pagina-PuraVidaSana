"use client";

import type { Category } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
  category: Category | "Todas";
  onCategoryChange: (c: Category | "Todas") => void;
  search: string;
  onSearchChange: (s: string) => void;
}

export function ProductFilters({
  categories,
  category,
  onCategoryChange,
  search,
  onSearchChange,
}: ProductFiltersProps) {
  return (
    <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm md:p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-forest/70">
            Buscar
          </label>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nombre o descripción..."
            className="w-full rounded-xl border border-forest/15 bg-white/70 px-3.5 py-3 text-base outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-forest/70">
            Categoría
          </label>
          <select
            value={category}
            onChange={(e) =>
              onCategoryChange(e.target.value as Category | "Todas")
            }
            className="w-full rounded-xl border border-forest/15 bg-white/70 px-3.5 py-3 text-base outline-none focus:border-leaf"
          >
            {(["Todas", ...categories] as const).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
