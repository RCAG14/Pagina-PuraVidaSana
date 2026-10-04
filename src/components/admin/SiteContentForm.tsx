"use client";

import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { activeFontFamily, customFontFaceCss, fontsFor } from "@/lib/fonts";
import { normalizeImageUrl } from "@/lib/imageUrl";
import { defaultSiteContent, mergeSiteContent } from "@/lib/site-content";
import { useStore } from "@/store/useStore";
import type { AboutPillar, CustomFont, SiteContent, TypographyContent } from "@/types";

function Field({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  const className =
    "w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      )}
    </label>
  );
}

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    throw new Error("Tu sesión de administrador expiró. Vuelve a iniciar sesión.");
  }
  if (!res.ok || !data.ok) {
    throw new Error(data.message ?? "No se pudo subir la imagen.");
  }
  return data.url as string;
}

function ImagePicker({
  label,
  value,
  placeholder,
  onUrlChange,
  onFileChange,
  uploading,
  error,
  previewClassName,
}: {
  label: string;
  value: string;
  placeholder: string;
  onUrlChange: (v: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  error?: string;
  previewClassName: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
        {label}
      </span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className={`shrink-0 rounded-xl border border-forest/10 ${previewClassName}`}
          />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onUrlChange(e.target.value)}
            onBlur={() => !value.startsWith("data:") && onUrlChange(normalizeImageUrl(value))}
            placeholder={
              value.startsWith("data:") ? "Imagen guardada en este navegador" : placeholder
            }
            className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
          />
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            disabled={uploading}
            className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-leaf/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-forest"
          />
          {uploading && <p className="text-xs text-ink/50">Subiendo imagen...</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </label>
  );
}

export function SiteContentForm() {
  const ready = useStore((s) => s.siteContentReady);
  // El formulario parte de lo guardado en el servidor, no de una copia
  // vieja del navegador, para no publicar contenido desactualizado.
  if (!ready) {
    return (
      <p className="rounded-2xl border border-forest/10 bg-white p-5 text-sm text-ink/50 shadow-sm">
        Cargando datos guardados...
      </p>
    );
  }
  return <SiteContentFormFields />;
}

function SiteContentFormFields() {
  const siteContent = useStore((s) => s.siteContent);
  const updateSiteContent = useStore((s) => s.updateSiteContent);
  const [form, setForm] = useState<SiteContent>(() => mergeSiteContent(siteContent));
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"logo" | "background" | null>(null);
  const [fontName, setFontName] = useState("");
  const [uploadingFont, setUploadingFont] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<{
    target: "logo" | "background";
    message: string;
  } | null>(null);

  const setTypography = (key: keyof TypographyContent, value: string) =>
    setForm((f) => ({ ...f, typography: { ...f.typography, [key]: value } }));

  const setNav = (key: keyof SiteContent["nav"], value: string) =>
    setForm((f) => ({ ...f, nav: { ...f.nav, [key]: value } }));

  const setHero = (key: keyof SiteContent["hero"], value: string) =>
    setForm((f) => ({ ...f, hero: { ...f.hero, [key]: value } }));

  const setAbout = (key: Exclude<keyof SiteContent["about"], "values">, value: string) =>
    setForm((f) => ({ ...f, about: { ...f.about, [key]: value } }));

  const setBenefits = (key: "eyebrow" | "title", value: string) =>
    setForm((f) => ({ ...f, benefits: { ...f.benefits, [key]: value } }));

  const setBenefit = (index: number, updates: Partial<AboutPillar>) =>
    setForm((f) => ({
      ...f,
      benefits: {
        ...f.benefits,
        items: f.benefits.items.map((item, i) =>
          i === index ? { ...item, ...updates } : item
        ),
      },
    }));

  const setFooterDescription = (value: string) =>
    setForm((f) => ({ ...f, footer: { ...f.footer, description: value } }));

  const setValue = (index: number, updates: Partial<AboutPillar>) =>
    setForm((f) => ({
      ...f,
      about: {
        ...f.about,
        values: f.about.values.map((p, i) =>
          i === index ? { ...p, ...updates } : p
        ),
      },
    }));

  const handleFile =
    (target: "logo" | "background") =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setUploading(target);
      setUploadError(null);
      try {
        const url = await uploadImage(file);
        if (target === "logo") setNav("logoUrl", url);
        else setHero("backgroundImage", url);
      } catch (err) {
        setUploadError({
          target,
          message: err instanceof Error ? err.message : "No se pudo subir la imagen.",
        });
      } finally {
        setUploading(null);
      }
    };

  const uploadFont = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (form.customFonts.length >= 12) {
      setFontError("Puedes cargar hasta 12 tipografías.");
      return;
    }
    setUploadingFont(true);
    setFontError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("label", fontName);
      const res = await fetch("/api/admin/fonts", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error("Tu sesión de administrador expiró. Vuelve a iniciar sesión.");
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "No se pudo cargar la tipografía.");
      }
      const font = data.font as CustomFont;
      setForm((f) => ({ ...f, customFonts: [...f.customFonts, font] }));
      setFontName("");
    } catch (err) {
      setFontError(err instanceof Error ? err.message : "No se pudo cargar la tipografía.");
    } finally {
      setUploadingFont(false);
    }
  };

  const removeFont = (id: string) => {
    setForm((f) => ({
      ...f,
      customFonts: f.customFonts.filter((font) => font.id !== id),
      typography: {
        body: f.typography.body === id ? defaultSiteContent.typography.body : f.typography.body,
        display:
          f.typography.display === id
            ? defaultSiteContent.typography.display
            : f.typography.display,
        script:
          f.typography.script === id
            ? defaultSiteContent.typography.script
            : f.typography.script,
      },
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const result = await updateSiteContent(form);
    if (!result.ok) {
      setSaveError(result.message ?? "No se pudo guardar.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-display text-xl font-bold text-forest">Tipografía</h3>
          <p className="mt-1 text-sm text-ink/60">
            Texto general, títulos y frases en letra manuscrita. El cambio se
            ve en todo el sitio al guardar.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {(
            [
              ["body", "Texto"],
              ["display", "Títulos"],
              ["script", "Manuscrita"],
            ] as const
          ).map(([role, label]) => {
            const selected = form.typography[role];
            return (
              <label key={role} className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
                  {label}
                </span>
                <select
                  value={selected}
                  onChange={(e) => setTypography(role, e.target.value)}
                  className="w-full rounded-xl border border-forest/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-leaf"
                >
                  {fontsFor(role).map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.label}
                    </option>
                  ))}
                  {form.customFonts.length > 0 && (
                    <optgroup label="Cargadas por ti">
                      {form.customFonts.map((font) => (
                        <option key={font.id} value={font.id}>
                          {font.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <p
                  className="mt-2 text-2xl text-forest"
                  style={{
                    fontFamily: `${activeFontFamily(role, selected, form.customFonts)}, sans-serif`,
                  }}
                >
                  {role === "script" ? "Pura Vida" : "Pura Vida Sana"}
                </p>
              </label>
            );
          })}
        </div>

        <style>{customFontFaceCss(form.customFonts)}</style>

        <div className="space-y-3 rounded-xl border border-dashed border-forest/20 bg-surface p-4">
          <p className="text-sm font-semibold text-forest">Cargar tipografía propia</p>
          <p className="text-xs text-ink/60">
            Archivo .ttf, .otf, .woff o .woff2, de hasta 8 MB. Después elígela
            en Texto, Títulos o Manuscrita y pulsa Guardar. Si la usas en
            Manuscrita, también cambia el nombre grande del inicio.
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
                Nombre
              </span>
              <input
                value={fontName}
                onChange={(e) => setFontName(e.target.value)}
                placeholder="Por ejemplo, Letra del logo"
                className="w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-leaf"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-forest/70">
                Archivo
              </span>
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
                onChange={uploadFont}
                disabled={uploadingFont}
                className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-leaf/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-forest"
              />
            </label>
          </div>
          {uploadingFont && <p className="text-xs text-ink/50">Cargando tipografía...</p>}
          {fontError && <p className="text-xs text-red-600">{fontError}</p>}
          {form.customFonts.length > 0 && (
            <ul className="space-y-2">
              {form.customFonts.map((font) => (
                <li
                  key={font.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
                >
                  <span className="text-lg text-forest" style={{ fontFamily: `"${font.id}", cursive` }}>
                    {font.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFont(font.id)}
                    className="rounded-lg p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Quitar ${font.label}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-display text-xl font-bold text-forest">Navbar</h3>
          <p className="mt-1 text-sm text-ink/60">
            Logo y nombre de la tienda que se ven arriba a la izquierda. El
            logo también se usa en el pie de página y en el panel.
          </p>
        </div>
        <ImagePicker
          label="Logo"
          value={form.nav.logoUrl}
          placeholder={defaultSiteContent.nav.logoUrl}
          onUrlChange={(v) => setNav("logoUrl", v)}
          onFileChange={handleFile("logo")}
          uploading={uploading === "logo"}
          error={uploadError?.target === "logo" ? uploadError.message : undefined}
          previewClassName="h-20 w-20 object-contain bg-surface p-1"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNav("logoUrl", defaultSiteContent.nav.logoUrl)}
            className="text-xs font-medium text-leaf underline-offset-2 hover:underline"
          >
            Restaurar logo original
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nombre junto al logo (opcional)"
            value={form.nav.brandName}
            onChange={(v) => setNav("brandName", v)}
          />
          <Field
            label="Frase debajo del nombre (opcional)"
            value={form.nav.brandTagline}
            onChange={(v) => setNav("brandTagline", v)}
          />
        </div>
        <p className="text-xs text-ink/50">
          El logo original ya trae escrito “Pura Vida Sana”. Si subes
          un logo sin texto, escribe aquí el nombre para que aparezca al lado.
        </p>

        <p className="pt-2 text-xs font-semibold uppercase text-forest/70">
          Enlaces del menú
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Inicio"
            value={form.nav.home}
            onChange={(v) => setNav("home", v)}
          />
          <Field
            label="Catálogo"
            value={form.nav.catalog}
            onChange={(v) => setNav("catalog", v)}
          />
          <Field
            label="Nosotros"
            value={form.nav.about}
            onChange={(v) => setNav("about", v)}
          />
        </div>
        <Field
          label="Texto del buscador"
          value={form.nav.searchPlaceholder}
          onChange={(v) => setNav("searchPlaceholder", v)}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-display text-xl font-bold text-forest">
            Pantalla principal
          </h3>
          <p className="mt-1 text-sm text-ink/60">
            Texto e imagen de fondo del inicio. La imagen también se usa en
            Nosotros.
          </p>
        </div>
        <div className="grid gap-4">
          <Field
            label="Nombre de la empresa (línea principal, la más grande)"
            value={form.hero.eyebrow}
            onChange={(v) => setHero("eyebrow", v)}
          />
          <Field
            label="Lema (segunda línea)"
            value={form.hero.title}
            onChange={(v) => setHero("title", v)}
            multiline
          />
          <Field
            label="Descripción (tercera línea)"
            value={form.hero.subtitle}
            onChange={(v) => setHero("subtitle", v)}
            multiline
          />
          <Field
            label="Nota al pie"
            value={form.hero.footnote}
            onChange={(v) => setHero("footnote", v)}
          />
          <ImagePicker
            label="Imagen de fondo"
            value={form.hero.backgroundImage}
            placeholder={defaultSiteContent.hero.backgroundImage}
            onUrlChange={(v) => setHero("backgroundImage", v)}
            onFileChange={handleFile("background")}
            uploading={uploading === "background"}
            error={uploadError?.target === "background" ? uploadError.message : undefined}
            previewClassName="h-24 w-40 object-cover"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-display text-xl font-bold text-forest">
            Página Nosotros
          </h3>
          <p className="mt-1 text-sm text-ink/60">
            Encabezado, historia, misión, visión, valores y filosofía de
            servicio. La introducción y la filosofía también se muestran en el
            inicio.
          </p>
        </div>
        <Field
          label="Texto superior"
          value={form.about.eyebrow}
          onChange={(v) => setAbout("eyebrow", v)}
        />
        <Field
          label="Título"
          value={form.about.title}
          onChange={(v) => setAbout("title", v)}
        />
        <Field
          label="Introducción"
          value={form.about.intro}
          onChange={(v) => setAbout("intro", v)}
          multiline
        />
        <Field
          label="Nuestra historia (deja una línea en blanco entre párrafos)"
          value={form.about.story}
          onChange={(v) => setAbout("story", v)}
          multiline
          rows={8}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <Field
            label="Misión"
            value={form.about.mission}
            onChange={(v) => setAbout("mission", v)}
            multiline
            rows={6}
          />
          <Field
            label="Visión"
            value={form.about.vision}
            onChange={(v) => setAbout("vision", v)}
            multiline
            rows={6}
          />
        </div>
        <p className="pt-2 text-xs font-semibold uppercase text-forest/70">
          Nuestros valores
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {form.about.values.map((value, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-forest/10 bg-surface p-4"
            >
              <p className="text-sm font-semibold text-forest">
                Valor {index + 1}
              </p>
              <Field
                label="Título"
                value={value.title}
                onChange={(v) => setValue(index, { title: v })}
              />
              <Field
                label="Texto"
                value={value.text}
                onChange={(v) => setValue(index, { text: v })}
                multiline
              />
            </div>
          ))}
        </div>
        <Field
          label="Filosofía de servicio (sin comillas)"
          value={form.about.philosophy}
          onChange={(v) => setAbout("philosophy", v)}
          multiline
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-display text-xl font-bold text-forest">
            Beneficios del inicio
          </h3>
          <p className="mt-1 text-sm text-ink/60">
            El título y las tres tarjetas de “Por qué elegirnos”.
          </p>
        </div>
        <Field
          label="Texto superior"
          value={form.benefits.eyebrow}
          onChange={(v) => setBenefits("eyebrow", v)}
        />
        <Field
          label="Título"
          value={form.benefits.title}
          onChange={(v) => setBenefits("title", v)}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {form.benefits.items.map((item, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-forest/10 bg-surface p-4"
            >
              <p className="text-sm font-semibold text-forest">
                Tarjeta {index + 1}
              </p>
              <Field
                label="Título"
                value={item.title}
                onChange={(v) => setBenefit(index, { title: v })}
              />
              <Field
                label="Texto"
                value={item.text}
                onChange={(v) => setBenefit(index, { text: v })}
                multiline
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-display text-xl font-bold text-forest">
            Pie de página
          </h3>
          <p className="mt-1 text-sm text-ink/60">
            El texto que aparece debajo del logo.
          </p>
        </div>
        <Field
          label="Descripción"
          value={form.footer.description}
          onChange={setFooterDescription}
          multiline
        />
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="secondary">
          <Save size={16} />
          Guardar contenido
        </Button>
        {saved && (
          <span className="text-sm text-leaf">Guardado — ya está en vivo.</span>
        )}
        {saveError && <span className="text-sm text-red-600">{saveError}</span>}
      </div>
    </form>
  );
}
