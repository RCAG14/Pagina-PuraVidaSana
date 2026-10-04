"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Gift, MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store/useStore";
import { pickWeightedPrize, generateWheelCode } from "@/lib/wheel";
import type { WheelPrize } from "@/lib/wheel";

const SEGMENT_COLORS = [
  "#184D28",
  "#71C22C",
  "#D97706",
  "#2A6B3C",
  "#8FD84A",
  "#B45F04",
];

function buildConicGradient(prizes: WheelPrize[], segmentAngle: number): string {
  const stops = prizes.map((_, i) => {
    const from = i * segmentAngle;
    const to = from + segmentAngle;
    const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
    return `${color} ${from}deg ${to}deg`;
  });
  return `conic-gradient(from 0deg, ${stops.join(", ")})`;
}

interface WheelForm {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  consentMarketing: boolean;
}

const emptyForm: WheelForm = {
  name: "",
  email: "",
  phone: "",
  birthdate: "",
  consentMarketing: false,
};

export function WheelModal() {
  const isWheelOpen = useStore((s) => s.isWheelOpen);
  const setWheelOpen = useStore((s) => s.setWheelOpen);
  const addWheelLead = useStore((s) => s.addWheelLead);
  const wheelPrizes = useStore((s) => s.wheelPrizes);
  const segmentAngle = 360 / wheelPrizes.length;

  const [step, setStep] = useState<"register" | "spin" | "result">("register");
  const [form, setForm] = useState<WheelForm>(emptyForm);
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState<{ prize: WheelPrize; index: number } | null>(
    null
  );
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    if (step === "spin") return;
    setWheelOpen(false);
  };

  const startSpin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consentMarketing) return;

    const picked = pickWeightedPrize(wheelPrizes);
    setSelected(picked);
    setStep("spin");

    const target =
      360 * 5 +
      (360 - (picked.index * segmentAngle + segmentAngle / 2));

    setTimeout(() => setRotation(target), 50);

    setTimeout(() => {
      const newCode = generateWheelCode();
      setCode(newCode);
      void addWheelLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        birthdate: form.birthdate || undefined,
        prizeLabel: picked.prize.label,
        prizeCode: newCode,
        consentMarketing: form.consentMarketing,
      });
      setStep("result");
    }, 4050);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isWheelOpen) return null;

  return (
    <Modal open onClose={handleClose} title="Gana un descuento" size="md">
      {step === "register" && (
        <form onSubmit={startSpin} className="space-y-4">
          <p className="text-sm text-ink/65">
            Regístrate y gira la ruleta para ganar un descuento en tu próxima
            compra. Usaremos tus datos para enviarte promociones y novedades.
          </p>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
              Nombre completo
            </span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
              Email
            </span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
                Teléfono
              </span>
              <input
                required
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
                Fecha de nacimiento (opcional)
              </span>
              <input
                type="date"
                value={form.birthdate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, birthdate: e.target.value }))
                }
                className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
              />
            </label>
          </div>

          <label className="flex items-start gap-2">
            <input
              required
              type="checkbox"
              checked={form.consentMarketing}
              onChange={(e) =>
                setForm((f) => ({ ...f, consentMarketing: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 accent-leaf"
            />
            <span className="text-sm text-ink/65">
              Acepto recibir promociones y anuncios de Pura Vida Sana.
              Ver{" "}
              <Link
                href="/terminos"
                target="_blank"
                className="underline hover:text-forest"
              >
                Términos y Privacidad
              </Link>
              .
            </span>
          </label>

          <Button type="submit" variant="secondary" className="w-full">
            <Gift size={16} />
            Girar la ruleta
          </Button>
        </form>
      )}

      {step === "spin" && (
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="relative h-64 w-64">
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
              <div className="h-0 w-0 border-x-8 border-t-[14px] border-x-transparent border-t-forest" />
            </div>
            <div
              className="relative h-full w-full rounded-full border-4 border-white shadow-lg"
              style={{
                background: buildConicGradient(wheelPrizes, segmentAngle),
                transform: `rotate(${rotation}deg)`,
                transition: "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)",
              }}
            >
              {wheelPrizes.map((prize, i) => {
                const angle = i * segmentAngle + segmentAngle / 2;
                const rad = ((angle - 90) * Math.PI) / 180;
                const x = 50 + 34 * Math.cos(rad);
                const y = 50 + 34 * Math.sin(rad);
                return (
                  <span
                    key={prize.label}
                    className="absolute w-16 -translate-x-1/2 -translate-y-1/2 text-center text-[10px] font-semibold leading-tight text-white"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    {prize.label}
                  </span>
                );
              })}
            </div>
          </div>
          <p className="text-sm text-ink/60">Girando...</p>
        </div>
      )}

      {step === "result" && selected && (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-soft text-leaf">
            <Gift size={32} />
          </span>
          <p className="text-sm text-ink/65">¡Felicidades! Ganaste:</p>
          <p className="text-2xl font-bold text-forest">
            {selected.prize.label}
          </p>
          <div className="w-full rounded-xl border border-dashed border-leaf/50 bg-soft px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-forest/60">
              Tu código
            </p>
            <p className="font-mono text-lg font-semibold text-forest">
              {code}
            </p>
          </div>
          <p className="text-xs text-ink/50">
            Menciona este código al hacer tu pedido por WhatsApp.
          </p>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={copyCode}>
              <Copy size={14} />
              {copied ? "¡Copiado!" : "Copiar código"}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setWheelOpen(false)}
            >
              <MessageCircle size={14} />
              Listo
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
