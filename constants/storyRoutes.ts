/** Cámara in-app para historias (estilo Instagram). */
export const CAMARA_HISTORIA_PATH = "/camara-historia" as const;

/** @deprecated Usar `camaraHistoriaHref()` */
export const NUEVA_HISTORIA_PATH = "/nueva-historia" as const;

export function camaraHistoriaHref() {
  return CAMARA_HISTORIA_PATH;
}

/** Entrada desde feed / menú crear: abre la cámara integrada. */
export function nuevaHistoriaHref(_openCamera = true) {
  return camaraHistoriaHref();
}
