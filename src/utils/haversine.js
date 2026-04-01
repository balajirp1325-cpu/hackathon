/**
 * Calculate distance between two coordinates using the Haversine formula.
 * @returns distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Filter and sort listings by proximity to a given point.
 */
function filterByRadius(listings, userLat, userLng, radiusKm) {
  return listings
    .map((listing) => ({
      ...listing,
      distance: haversineDistance(
        userLat,
        userLng,
        listing.latitude,
        listing.longitude
      ),
    }))
    .filter((listing) => listing.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

module.exports = { haversineDistance, filterByRadius };
