/** Radio «Cerca» en discover (km), alineado con Goi Server. */
export const NEARBY_MAX_KM = 50;

export type GeoPoint = {
  latitude?: number | null;
  longitude?: number | null;
  location?: string | null;
  hasGeoLocation?: boolean;
};

export function hasGeoPoint(point: GeoPoint | null | undefined): point is {
  latitude: number;
  longitude: number;
} {
  return (
    typeof point?.latitude === "number" &&
    Number.isFinite(point.latitude) &&
    typeof point?.longitude === "number" &&
    Number.isFinite(point.longitude)
  );
}

export function viewerHasDiscoverLocation(viewer: GeoPoint | null | undefined): boolean {
  if (!viewer) return false;
  if (hasGeoPoint(viewer) || viewer.hasGeoLocation) return true;
  return (viewer.location ?? "").trim().length > 0;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
