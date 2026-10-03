// Convierte enlaces de "compartir" de Google Drive en una URL que se puede
// mostrar directamente en <img>. Cualquier otra URL se devuelve tal cual.
//   https://drive.google.com/file/d/ID/view?usp=sharing
//   https://drive.google.com/open?id=ID
//   https://drive.google.com/uc?id=ID&export=view
// El archivo debe estar compartido como "Cualquier persona con el enlace".
export function normalizeImageUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return "";

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (!/(^|\.)drive\.google\.com$|^docs\.google\.com$/.test(parsed.hostname)) {
    return url;
  }

  const fromPath = parsed.pathname.match(/\/d\/([\w-]{10,})/)?.[1];
  const id = fromPath ?? parsed.searchParams.get("id");
  return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
}
