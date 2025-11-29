"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = exports.getSurgeMultiplier = exports.estimateTime = exports.calculateDistance = void 0;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};
exports.calculateDistance = calculateDistance;
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
const estimateTime = (distanceKm) => {
    // Simple estimation: 20km/h average speed in city
    const speed = 20;
    return (distanceKm / speed) * 60; // Minutes
};
exports.estimateTime = estimateTime;
const getSurgeMultiplier = (hour) => {
    // Surge between 6PM and 9PM
    if (hour >= 18 && hour <= 21) {
        return 1.5;
    }
    return 1.0;
};
exports.getSurgeMultiplier = getSurgeMultiplier;
const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
exports.generateOtp = generateOtp;
//# sourceMappingURL=utils.js.map