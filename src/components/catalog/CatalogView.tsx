"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Category } from "@/types";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFilters } from "@/components/catalog/ProductFilters";
import { Pagination } from "@/components/ui/Pagination";
import { useStore } from "@/store/useStore";
import { getAllCategories } from "@/lib/categories";

const PAGE_SIZE = 12;

export function CatalogView() {
  const products = useStore((s) => s.products);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const searchParams = useSearchParams();
  const categories = useMemo(() => getAllCategories(products), [products]);

  const [category, setCategory] = useState<Category | "Todas">("Todas");
  const [search, setSearch] = useState(searchQuery);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("categoria");
    if (q) {
      setSearch(q);
      setSearchQuery(q);
    }
    if (cat) {
      setCategory(cat as Category);
    }
  }, [searchParams, setSearchQuery]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchCat = category === "Todas" || p.category === category;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <ProductFilters
        categories={categories}
        category={category}
        onCategoryChange={(c) => {
          setCategory(c);
          setPage(1);
        }}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setSearchQuery(v);
          setPage(1);
        }}
      />

      <div className="flex items-center justify-between">
        <p className="inline-block rounded-full bg-white px-4 py-2 text-base text-ink/60 shadow-sm">
          {filtered.length} producto{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-forest/20 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-medium text-forest">Sin resultados</p>
          <p className="mt-1 text-base text-ink/60">
            Ajusta la categoría o la búsqueda.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((product) => (
              <ProductCard key={product.id} product={product} variant="solid" />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="rounded-full bg-white px-2 shadow-sm">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
