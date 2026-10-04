import type { Metadata } from "next";
import {
  Caveat,
  Courgette,
  Dancing_Script,
  Fredoka,
  Great_Vibes,
  Kaushan_Script,
  Lora,
  Montserrat,
  Nunito,
  Outfit,
  Pacifico,
  Playfair_Display,
  Source_Sans_3,
} from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { StoreHydration } from "@/components/providers/StoreHydration";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const kaushanScript = Kaushan_Script({
  variable: "--font-kaushan",
  subsets: ["latin"],
  weight: "400",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const courgette = Courgette({
  variable: "--font-courgette",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Pura Vida Sana | Salud integral en La Paz",
  description:
    "Tienda de suplementos, vitaminas y productos naturales en La Paz, Bolivia. Pide online y coordina el pago por WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${kaushanScript.variable} ${fredoka.variable} ${nunito.variable} ${outfit.variable} ${sourceSans.variable} ${lora.variable} ${playfair.variable} ${greatVibes.variable} ${pacifico.variable} ${dancingScript.variable} ${caveat.variable} ${courgette.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <StoreHydration>
          <SiteChrome>{children}</SiteChrome>
        </StoreHydration>
      </body>
    </html>
  );
}
