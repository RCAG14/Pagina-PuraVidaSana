"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function AdminHeader() {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-forest text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Logo size="sm" onDark />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[11px] uppercase tracking-wide text-white/55">
            Pura Vida Sana
          </p>
          <p className="font-display truncate text-lg font-bold">
            Panel de administración
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/"
            className="pop-glow inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium text-white/80 hover:text-leaf sm:px-3"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Volver a la tienda</span>
          </Link>
          {!isLogin && (
            <button
              onClick={logout}
              className="pop-glow inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-2.5 py-2 text-sm font-medium text-white/80 hover:text-leaf sm:px-3"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
