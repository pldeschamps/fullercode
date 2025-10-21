// GeoPoint.js
// D�pend de GeoCoord.js et Cartesian3.js (doivent �tre charg�s avant ce fichier)

class GeoPoint {
    constructor(id, lat = null, lon = null, x = null, y = null, z = null) {
        this.id = id;
        this.geo = (lat !== null && lon !== null) ? new GeoCoord(lat, lon) : null;
        this.cart = (x !== null && y !== null && z !== null) ? new Cesium.Cartesian3(x, y, z) : null;
    }

    // Calcule x, y, z � partir de lat, lon (WGS84, rayon approx. 6371 km)
    computeXYZ(radius = 6371000) {
        if (this.geo) {
            const radLat = this.geo.lat * Math.PI / 180;
            const radLon = this.geo.lon * Math.PI / 180;
            const x = radius * Math.cos(radLat) * Math.cos(radLon);
            const y = radius * Math.cos(radLat) * Math.sin(radLon);
            const z = radius * Math.sin(radLat);
            this.cart = new Cartesian3(x, y, z);
        }
    }

    // Calcule lat, lon � partir de x, y, z
    computeLatLon() {
        if (this.cart) {
            const { x, y, z } = this.cart;
            const radius = Math.sqrt(x * x + y * y + z * z);
            const lat = Math.asin(z / radius) * 180 / Math.PI;
            const lon = Math.atan2(y, x) * 180 / Math.PI;
            this.geo = new GeoCoord(lat, lon);
        }
    }
}

// Rendre la classe accessible globalement
window.GeoPoint = GeoPoint;