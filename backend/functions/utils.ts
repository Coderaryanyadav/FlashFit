export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export const estimateTime = (distanceKm: number): number => {
  // Simple estimation: 20km/h average speed in city
  const speed = 20;
  return (distanceKm / speed) * 60; // Minutes
};

export const getSurgeMultiplier = (hour: number): number => {
  // Surge between 6PM and 9PM
  if (hour >= 18 && hour <= 21) {
    return 1.5;
  }
  return 1.0;
};

export const generateOtp = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
