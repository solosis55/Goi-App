import * as Location from "expo-location";
import { Linking, Platform } from "react-native";

export type DeviceLocationResult =
  | {
      ok: true;
      latitude: number;
      longitude: number;
      location: string;
    }
  | { ok: false; cancelled?: boolean; error: string; canOpenSettings?: boolean };

async function buildLocationLabel(latitude: number, longitude: number): Promise<string> {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    const place = places[0];
    if (place) {
      const parts = [place.city, place.subregion, place.region, place.country].filter(Boolean);
      const label = [...new Set(parts.map((p) => String(p).trim()))].join(", ");
      if (label) return label.slice(0, 80);
    }
  } catch {
    /* sin geocoding */
  }
  return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
}

/** Pide permiso de ubicación en primer plano (discover «Cerca»). */
export async function requestForegroundLocationPermission(): Promise<Location.PermissionStatus> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.status === "granted") return current.status;
  const next = await Location.requestForegroundPermissionsAsync();
  return next.status;
}

export function openDeviceSettings() {
  void Linking.openSettings();
}

/** Obtiene posición actual y etiqueta legible (ciudad/región). */
export async function readDeviceLocation(): Promise<DeviceLocationResult> {
  if (Platform.OS === "web") {
    return { ok: false, error: "La ubicación GPS no está disponible en web." };
  }

  const status = await requestForegroundLocationPermission();
  if (status !== "granted") {
    const canOpenSettings = status === "denied";
    return {
      ok: false,
      error:
        status === "denied"
          ? "Activa la ubicación para Goi en Ajustes del dispositivo."
          : "Necesitamos permiso de ubicación para mostrarte atletas cerca.",
      canOpenSettings,
    };
  }

  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = pos.coords;
    const location = await buildLocationLabel(latitude, longitude);
    return { ok: true, latitude, longitude, location };
  } catch {
    return { ok: false, error: "No se pudo obtener tu ubicación. Inténtalo en exteriores o más tarde." };
  }
}
