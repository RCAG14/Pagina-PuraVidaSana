"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/store/useStore";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  // El logo tiene un anillo verde que se funde con fondos oscuros (como el
  // footer, bg-forest). onDark le agrega un respaldo circular claro para
  // que el anillo se distinga del fondo en vez de opacarse.
  onDark?: boolean;
}

const sizes: Record<"sm" | "md" | "lg", { width: number; height: number }> = {
  sm: { width: 52, height: 52 },
  md: { width: 76, height: 76 },
  lg: { width: 116, height: 116 },
};

export function Logo({ size = "md", onDark = false }: LogoProps) {
  const { width, height } = sizes[size];
  const logoUrl = useStore((s) => s.siteContent.nav?.logoUrl) || "/logo.png";
  const storeName = useStore((s) => s.storeInfo.name);
  // Hasta saber qué logo está guardado se reserva el espacio vacío; si no,
  // se ve un instante el logo por defecto antes del configurado.
  const ready = useStore((s) => s.siteContentReady);
  const isStatic = logoUrl.startsWith("/") && !logoUrl.startsWith("/api/");

  return (
    <Link href="/" className="group inline-flex items-center">
      <span
        className={
          onDark
            ? "inline-flex rounded-full bg-white/95 p-1.5 shadow-lg shadow-black/20 ring-1 ring-white/40 transition group-hover:scale-105"
            : "inline-flex transition group-hover:scale-105"
        }
      >
        {ready ? (
          <Image
            key={logoUrl}
            src={logoUrl}
            alt={storeName || "Pura Vida Sana"}
            width={width}
            height={height}
            className="block object-contain"
            style={{ width, height }}
            loading="eager"
            unoptimized={!isStatic}
          />
        ) : (
          <span className="block" style={{ width, height }} aria-hidden />
        )}
      </span>
    </Link>
  );
}
