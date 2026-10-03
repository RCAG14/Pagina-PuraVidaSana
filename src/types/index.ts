import type { WheelPrize } from "@/lib/wheel";

export type Category =
  | "Suplementos"
  | "Vitaminas"
  | "Cosmética Natural"
  | "Proteínas"
  // Categorías creadas desde administración
  | (string & {});

export type StockStatus = "Disponible" | "Bajo Stock" | "Agotado";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  description: string;
  image: string;
  featured?: boolean;
  images?: string[];
  benefits?: string[];
  tags?: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  cityZone: string;
  address: string;
}

export type OrderStatus = "Pendiente" | "Confirmado" | "Cancelado";

export interface Order {
  id: string;
  items: CartItem[];
  shipping: ShippingInfo;
  total: number;
  shippingFee: number;
  paymentMethod: "whatsapp";
  status: OrderStatus;
  createdAt: string;
}

export interface StoreData {
  products: Product[];
  cart: CartItem[];
  lastOrder: Order | null;
}

export interface StoreInfo {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  branches: Branch[];
  instagram: string;
  facebook: string;
  tiktok: string;
  shippingFee: number;
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  footnote: string;
  backgroundImage: string;
}

export interface AboutPillar {
  title: string;
  text: string;
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  intro: string;
  // Párrafos separados por una línea en blanco.
  story: string;
  mission: string;
  vision: string;
  values: AboutPillar[];
  philosophy: string;
}

export interface BenefitItem {
  title: string;
  text: string;
}

export interface BenefitsContent {
  eyebrow: string;
  title: string;
  items: BenefitItem[];
}

export interface FooterContent {
  description: string;
}

export interface NavContent {
  logoUrl: string;
  brandName: string;
  brandTagline: string;
  home: string;
  catalog: string;
  about: string;
  searchPlaceholder: string;
}

export interface TypographyContent {
  body: string;
  display: string;
  script: string;
}

export interface CustomFont {
  id: string;
  label: string;
  url: string;
  format: "woff2" | "woff" | "truetype" | "opentype";
}

export interface SiteContent {
  nav: NavContent;
  typography: TypographyContent;
  customFonts: CustomFont[];
  hero: HeroContent;
  about: AboutContent;
  benefits: BenefitsContent;
  footer: FooterContent;
}

// Configuración del negocio y de la ruleta que el admin edita en el panel
// y que se guarda en el servidor para todos los visitantes.
export interface StoreSettings {
  storeInfo: StoreInfo;
  wheelPrizes: WheelPrize[];
  wheelEnabled: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lon: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  relativeDate: string;
}

export interface GoogleReviewsResponse {
  source: "google" | "mock";
  rating: number;
  totalReviews: number;
  reviews: Review[];
}

export interface WheelLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthdate?: string;
  prizeLabel: string;
  prizeCode: string;
  consentMarketing: boolean;
  createdAt: string;
}
