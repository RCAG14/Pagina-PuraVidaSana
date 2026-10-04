import type { CustomFont, SiteContent } from "@/types";
import { CUSTOM_FONT_FORMATS, isCustomFontId, isFontId } from "@/lib/fonts";

export const DEFAULT_BACKGROUND = "/fondo-inicio.jpg";

// Fondo anterior (foto de bosque). Si lo guardado sigue siendo esa URL, nadie
// lo cambió desde el panel y se reemplaza por el fondo nuevo.
const LEGACY_BACKGROUND =
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1800&q=80";

// El inicio pasó de "frase chica + título largo" a "nombre grande + lema +
// descripción". Si lo guardado conserva el título de la versión anterior,
// se reemplazan los tres textos por los nuevos para que encajen en ese orden.
const LEGACY_HERO_TITLE = "Salud integral natural en el corazón de La Paz";

// Textos de la versión anterior a la identidad institucional (misión, visión,
// valores). Si lo guardado sigue siendo exactamente uno de estos, nadie lo
// editó desde el panel y se reemplaza por el texto nuevo; lo editado se respeta.
const LEGACY = {
  heroSubtitle:
    "Productos naturales, suplementos y vitaminas para acompañarte en tu bienestar.",
  aboutTitle: "Pura Vida Sana",
  aboutIntro:
    "Nacimos en La Paz con una idea simple: acercar bienestar natural confiable a familias bolivianas, con asesoría cercana y productos seleccionados para la vida en altura.",
  benefitTitle: "Productos 100% Naturales",
  benefitText: "Selección cuidada de fórmulas limpia y origen confiable.",
  footer:
    "Suplementos, vitaminas y cosmética natural para tu bienestar diario en La Paz y todo Bolivia.",
};

function upgradeLegacy(
  value: string | undefined,
  legacy: string,
  next: string
): string | undefined {
  return value === legacy ? next : value;
}

function migrateHero(saved: SiteContent["hero"]): SiteContent["hero"] {
  const hero = {
    ...saved,
    backgroundImage:
      upgradeLegacy(saved.backgroundImage, LEGACY_BACKGROUND, DEFAULT_BACKGROUND) ??
      DEFAULT_BACKGROUND,
  };
  if (hero.title !== LEGACY_HERO_TITLE) {
    return {
      ...hero,
      subtitle:
        upgradeLegacy(hero.subtitle, LEGACY.heroSubtitle, defaultSiteContent.hero.subtitle) ??
        defaultSiteContent.hero.subtitle,
    };
  }
  const { eyebrow, title, subtitle } = defaultSiteContent.hero;
  return { ...hero, eyebrow, title, subtitle };
}

function migrateAbout(about: Partial<SiteContent["about"]> | undefined): SiteContent["about"] {
  const d = defaultSiteContent.about;
  // La versión anterior traía título e introducción pensados para tres
  // tarjetas; si siguen sin editar, se pasa entero al contenido nuevo.
  const legacy = about?.title === LEGACY.aboutTitle && about?.intro === LEGACY.aboutIntro;
  const values = about?.values?.filter((v) => v && (v.title || v.text));
  return {
    eyebrow: about?.eyebrow ?? d.eyebrow,
    title: legacy ? d.title : about?.title ?? d.title,
    intro: legacy ? d.intro : about?.intro ?? d.intro,
    story: about?.story ?? d.story,
    mission: about?.mission ?? d.mission,
    vision: about?.vision ?? d.vision,
    values: fixedItems(values, d.values),
    philosophy: about?.philosophy ?? d.philosophy,
  };
}

export const defaultSiteContent: SiteContent = {
  nav: {
    logoUrl: "/logo.png",
    brandName: "",
    brandTagline: "",
    home: "Inicio",
    catalog: "Catálogo",
    about: "Nosotros",
    searchPlaceholder: "Buscar vitaminas, suplementos...",
  },
  typography: {
    body: "montserrat",
    display: "fredoka",
    script: "kaushan",
  },
  customFonts: [],
  hero: {
    eyebrow: "Pura Vida Sana",
    title: "Tu casa natural, más cerca de ti.",
    subtitle:
      "Productos y suplementos naturales y orgánicos, con una atención cercana que escucha, orienta y recomienda según lo que realmente necesitas.",
    footnote: "Envíos a La Paz y todo el país · Pedido y pago por WhatsApp",
    backgroundImage: DEFAULT_BACKGROUND,
  },
  about: {
    eyebrow: "Nuestra esencia",
    title: "Tu casa natural, más cerca de ti.",
    intro:
      "Pura Vida Sana es una empresa boliviana dedicada a la comercialización de productos y suplementos naturales y orgánicos, comprometida con el bienestar y el cuidado de las personas.",
    story: [
      "Nació hace 18 años de la mano de Julieta Cortez Camino, quien contaba con experiencia en el ámbito de los productos naturales y dio origen a una empresa basada en la atención cercana y el compromiso con las personas.",
      "Hoy, Pura Vida Sana continúa ese legado, buscando acercar alternativas naturales a personas de todas las edades y acompañarlas mediante una atención orientada a sus necesidades. Más que ofrecer productos, buscamos escuchar, orientar y recomendar de manera responsable, entendiendo que cada persona tiene necesidades diferentes.",
      "Actualmente contamos con dos sucursales en La Paz y una tienda online, con el propósito de seguir creciendo y acercando nuestros productos a más personas en Bolivia.",
    ].join("\n\n"),
    mission:
      "Brindar productos y suplementos naturales y orgánicos que contribuyan al bienestar de las personas, ofreciendo una atención cercana, responsable y orientada a sus necesidades. Buscamos promover hábitos saludables y facilitar el acceso a alternativas naturales, manteniendo como principios fundamentales la confianza, la calidad, el servicio, el compromiso y el bienestar.",
    vision:
      "Consolidarnos como una empresa referente en productos y suplementos naturales en Bolivia, creciendo de manera sostenible y acercando Pura Vida Sana a cada vez más personas mediante nuevas tiendas y canales de venta. A largo plazo, buscamos llevar nuestra propuesta más allá de Bolivia y expandirnos hacia otros países de Latinoamérica, manteniendo siempre la confianza, la calidad, el servicio, el compromiso y el bienestar que nos caracterizan.",
    values: [
      {
        title: "Confianza",
        text: "Construimos relaciones duraderas con nuestros clientes mediante transparencia, responsabilidad y recomendaciones pensadas para sus necesidades.",
      },
      {
        title: "Calidad",
        text: "Buscamos ofrecer productos naturales y suplementos seleccionados con responsabilidad y bajo criterios de calidad.",
      },
      {
        title: "Servicio",
        text: "Escuchamos y orientamos a nuestros clientes para ayudarles a encontrar alternativas acordes con sus necesidades.",
      },
      {
        title: "Compromiso",
        text: "Trabajamos para mantener el propósito con el que nació Pura Vida Sana y continuar construyendo sobre ese legado.",
      },
      {
        title: "Bienestar",
        text: "Nuestro trabajo busca contribuir al cuidado y bienestar de las personas mediante alternativas naturales y hábitos saludables.",
      },
    ],
    philosophy: "No se trata de vender más, sino de ofrecer lo que realmente necesitas.",
  },
  benefits: {
    eyebrow: "Por qué elegirnos",
    title: "Beneficios que se sienten",
    items: [
      {
        title: "Envíos a La Paz y todo el país",
        text: "Entrega local rápida y despacho nacional con seguimiento.",
      },
      {
        title: "Productos naturales y orgánicos",
        text: "Seleccionados con responsabilidad y bajo criterios de calidad.",
      },
      {
        title: "Confirmación directa por WhatsApp",
        text: "Coordina tu pedido y la forma de pago con nuestro equipo.",
      },
    ],
  },
  footer: {
    description:
      "Productos y suplementos naturales y orgánicos para tu bienestar, con dos sucursales en La Paz y envíos a todo Bolivia.",
  },
};

const FONT_FORMATS = new Set<string>(Object.values(CUSTOM_FONT_FORMATS));

function sanitizeCustomFonts(value: unknown): CustomFont[] {
  if (!Array.isArray(value)) return [];
  const fonts: CustomFont[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const font = item as Partial<CustomFont>;
    if (
      typeof font.id !== "string" ||
      !/^custom-[a-z0-9]+$/.test(font.id) ||
      typeof font.label !== "string" ||
      !font.label.trim() ||
      typeof font.url !== "string" ||
      !/^\/api\/uploads\/[\w-]+\.(woff2|woff|ttf|otf)$/.test(font.url) ||
      typeof font.format !== "string" ||
      !FONT_FORMATS.has(font.format)
    ) {
      continue;
    }
    fonts.push({
      id: font.id,
      label: font.label.trim().slice(0, 60),
      url: font.url,
      format: font.format as CustomFont["format"],
    });
    if (fonts.length >= 12) break;
  }
  return fonts;
}

// Siempre tantas tarjetas como trae el contenido por defecto.
function fixedItems(
  value: { title?: string; text?: string }[] | undefined,
  fallback: { title: string; text: string }[]
) {
  return fallback.map((item, index) => ({
    title: value?.[index]?.title ?? item.title,
    text: value?.[index]?.text ?? item.text,
  }));
}

function pickFont(
  role: "body" | "display" | "script",
  id: string | undefined,
  fonts: CustomFont[]
): string {
  if (id && (isFontId(role, id) || isCustomFontId(id, fonts))) return id;
  return defaultSiteContent.typography[role];
}

export function mergeSiteContent(value: Partial<SiteContent> | undefined): SiteContent {
  const benefitItems = value?.benefits?.items?.map((item) =>
    item?.title === LEGACY.benefitTitle && item?.text === LEGACY.benefitText
      ? defaultSiteContent.benefits.items[1]
      : item
  );
  const customFonts = sanitizeCustomFonts(value?.customFonts);
  return {
    nav: {
      ...defaultSiteContent.nav,
      ...value?.nav,
      logoUrl: value?.nav?.logoUrl || defaultSiteContent.nav.logoUrl,
    },
    typography: {
      body: pickFont("body", value?.typography?.body, customFonts),
      display: pickFont("display", value?.typography?.display, customFonts),
      script: pickFont("script", value?.typography?.script, customFonts),
    },
    customFonts,
    hero: migrateHero({ ...defaultSiteContent.hero, ...value?.hero }),
    about: migrateAbout(value?.about),
    benefits: {
      eyebrow: value?.benefits?.eyebrow ?? defaultSiteContent.benefits.eyebrow,
      title: value?.benefits?.title ?? defaultSiteContent.benefits.title,
      items: fixedItems(benefitItems, defaultSiteContent.benefits.items),
    },
    footer: {
      description:
        upgradeLegacy(
          value?.footer?.description,
          LEGACY.footer,
          defaultSiteContent.footer.description
        ) ?? defaultSiteContent.footer.description,
    },
  };
}
