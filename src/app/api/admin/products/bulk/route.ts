import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { insertLocalProducts } from "@/lib/products-local";
import { isSupabaseUnreachable, SUPABASE_DOWN_MESSAGE } from "@/lib/supabase/errors";
import { getServiceClient } from "@/lib/supabase/server";
import { normalizeCategory } from "@/lib/categories";
import { normalizeImageUrl } from "@/lib/imageUrl";

export const runtime = "nodejs";

interface BulkRow {
  name?: unknown;
  category?: unknown;
  price?: unknown;
  stock?: unknown;
  description?: unknown;
  image?: unknown;
  featured?: unknown;
  images?: unknown;
  benefits?: unknown;
  tags?: unknown;
}

interface ValidatedProduct {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  featured: boolean;
  images: string[];
  benefits: string[];
  tags: string[];
}

type ValidateResult = { ok: true; product: ValidatedProduct } | { ok: false; error: string };

function validateRow(row: BulkRow, index: number): ValidateResult {
  if (typeof row.name !== "string" || !row.name.trim()) {
    return { ok: false, error: `Fila ${index + 1}: falta el nombre.` };
  }
  const category = normalizeCategory(row.category);
  if (!category) {
    return {
      ok: false,
      error: `Fila ${index + 1}: categoría inválida ("${row.category ?? ""}").`,
    };
  }
  const price = typeof row.price === "number" ? row.price : Number(row.price);
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: `Fila ${index + 1}: precio inválido.` };
  }
  const stock = typeof row.stock === "number" ? row.stock : Number(row.stock);
  if (!Number.isFinite(stock) || stock < 0) {
    return { ok: false, error: `Fila ${index + 1}: stock inválido.` };
  }

  return {
    ok: true,
    product: {
      name: (row.name as string).trim(),
      category,
      price,
      stock,
      description: typeof row.description === "string" ? row.description : "",
      image: typeof row.image === "string" ? normalizeImageUrl(row.image) : "",
      featured: !!row.featured,
      images: Array.isArray(row.images)
        ? row.images.filter((u): u is string => typeof u === "string").map(normalizeImageUrl).filter(Boolean)
        : [],
      benefits: Array.isArray(row.benefits) ? row.benefits : [],
      tags: Array.isArray(row.tags) ? row.tags : [],
    },
  };
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.products) || body.products.length === 0) {
    return NextResponse.json(
      { ok: false, message: "No se recibieron filas para importar." },
      { status: 400 }
    );
  }
  if (body.products.length > 500) {
    return NextResponse.json(
      { ok: false, message: "Máximo 500 filas por importación." },
      { status: 400 }
    );
  }

  const rejected: string[] = [];
  const toInsert: ValidatedProduct[] = [];

  body.products.forEach((row: BulkRow, index: number) => {
    const result = validateRow(row, index);
    if (result.ok) {
      toInsert.push(result.product);
    } else {
      rejected.push(result.error);
    }
  });

  if (toInsert.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Ninguna fila pasó la validación.", rejected },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await getServiceClient()
      .from("products")
      .insert(toInsert)
      .select();

    if (error) {
      if (isSupabaseUnreachable(error)) {
        const created = await insertLocalProducts(toInsert);
        return NextResponse.json({
          ok: true,
          created,
          rejected,
          warning: SUPABASE_DOWN_MESSAGE,
        });
      }
      return NextResponse.json(
        { ok: false, message: "No se pudieron crear los productos: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, created: data, rejected });
  } catch (err) {
    if (isSupabaseUnreachable(err)) {
      const created = await insertLocalProducts(toInsert);
      return NextResponse.json({
        ok: true,
        created,
        rejected,
        warning: SUPABASE_DOWN_MESSAGE,
      });
    }
    const message = err instanceof Error ? err.message : "Error inesperado.";
    return NextResponse.json(
      { ok: false, message: "No se pudieron crear los productos: " + message },
      { status: 500 }
    );
  }
}
