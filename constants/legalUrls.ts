/** URL pública de Goi Web (legales y verificación en navegador). */
export const GOI_WEB_BASE_URL = "https://go-i.vercel.app";

export const LEGAL_URLS = {
  privacy: `${GOI_WEB_BASE_URL}/privacidad`,
  legalNotice: `${GOI_WEB_BASE_URL}/aviso-legal`,
  contact: `${GOI_WEB_BASE_URL}/contacto`,
} as const;
