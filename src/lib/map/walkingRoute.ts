/** Haversine distance in meters between two lat/lng points */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatWalkDistance(meters: number): string {
  const feet = meters * 3.28084;
  if (feet < 1000) return `${Math.round(feet)} ft`;
  const miles = meters / 1609.344;
  if (miles < 0.1) return `${Math.round(feet)} ft`;
  return `${miles.toFixed(miles < 10 ? 1 : 0)} mi`;
}

export function estimateWalkMinutes(meters: number): number {
  // Garden strolling ~1.2 m/s
  return Math.max(1, Math.round(meters / 72));
}
