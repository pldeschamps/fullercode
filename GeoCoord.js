// GeoCoord.js
// Utility class for geographic coordinates

class GeoCoord {
    constructor(lat, lon) {
        this.lat = lat;
        this.lon = lon;
    }

    toString() {
        return `${this.lat}, ${this.lon}`;
    }

    static distance(coord1, coord2) {
        // Haversine formula to calculate distance between two coordinates
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Earth radius in kilometers

        const dLat = toRad(coord2.lat - coord1.lat);
        const dLon = toRad(coord2.lon - coord1.lon);

        const lat1 = toRad(coord1.lat);
        const lat2 = toRad(coord2.lat);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}

window.GeoCoord = GeoCoord;