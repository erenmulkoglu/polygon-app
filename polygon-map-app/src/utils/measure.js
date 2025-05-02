export function calculateDistance(coordinates) {
  if (!coordinates || coordinates.length < 2) return 0;

  const R = 6371e3; // Dünya'nın yarıçapı (metre)
  
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const [lon1, lat1] = coordinates[0];
  const [lon2, lat2] = coordinates[1];

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Mesafe metre cinsinden döndürülüyor
}
