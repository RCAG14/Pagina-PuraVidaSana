import type { ShippingInfo, StockStatus } from "@/types";

export function productWhatsAppUrl(phone: string, productName: string): string {
  const text = encodeURIComponent(
    `Hola Pura Vida Sana, me interesa "${productName}". ¿Me pueden dar más información?`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export function formatBs(amount: number): string {
  return `Bs. ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "Agotado";
  if (stock < 5) return "Bajo Stock";
  return "Disponible";
}

export function stockStatusClasses(status: StockStatus): string {
  switch (status) {
    case "Disponible":
      return "bg-leaf/15 text-forest border-leaf/30";
    case "Bajo Stock":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "Agotado":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

export interface WhatsAppOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export function buildWhatsAppOrderUrl(
  phone: string,
  orderId: string,
  items: WhatsAppOrderItem[],
  total: number,
  shippingFee: number,
  shipping: ShippingInfo
): string {
  const productLines = items
    .map((i) => `• ${i.name} x${i.quantity} — ${formatBs(i.price * i.quantity)}`)
    .join("\n");

  const totalLines =
    shippingFee > 0
      ? [
          `Subtotal: ${formatBs(total - shippingFee)}`,
          `Envío: ${formatBs(shippingFee)}`,
          `*Total: ${formatBs(total)}*`,
        ]
      : [`*Total: ${formatBs(total)}*`];

  const message = [
    "Hola, quiero realizar el siguiente pedido a Pura Vida Sana.",
    `*Orden:* ${orderId}`,
    `*Cliente:* ${shipping.name}`,
    `*Teléfono:* ${shipping.phone}`,
    `*Entrega:* ${shipping.cityZone} - ${shipping.address}`,
    "*Productos:*",
    productLines,
    ...totalLines,
    "Quedo atento/a a la confirmación y la forma de pago. ¡Gracias!",
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildMapEmbedUrl(lat: number, lon: number, delta = 0.01): string {
  const minLon = lon - delta;
  const maxLon = lon + delta;
  const minLat = lat - delta * 0.7;
  const maxLat = lat + delta * 0.7;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lon}`;
}
