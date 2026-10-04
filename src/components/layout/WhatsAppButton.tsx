"use client";

import { MessageCircle } from "lucide-react";
import { useStore } from "@/store/useStore";

export function WhatsAppButton() {
  const storeInfo = useStore((s) => s.storeInfo);
  const message = encodeURIComponent(
    "Hola Pura Vida Sana, quisiera más información sobre sus productos."
  );
  const href = `https://wa.me/${storeInfo.whatsapp}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="animate-soft-pulse fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-leaf text-white shadow-lg shadow-forest/25 md:bottom-6 md:right-6"
    >
      <MessageCircle size={26} className="pop-glow hover:text-forest" />
    </a>
  );
}
