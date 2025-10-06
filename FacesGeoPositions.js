class FacesGeoPositions {
    constructor(faceId, vertices) {
        this.faceId = faceId;
        this.vertices = vertices; // Array of Cesium.Cartesian3
        this.center = this.computeCenter();
    }

    // Compute the centroid in Cartesian coordinates
    computeCenter() {
        if (this.vertices.length !== 3) return null;
        //console.log("this.vertices[0].x:", this.vertices[0].x);
        let x = (this.vertices[0].x + this.vertices[1].x + this.vertices[2].x) ;
        let y = (this.vertices[0].y + this.vertices[1].y + this.vertices[2].y) ;
        let z = (this.vertices[0].z + this.vertices[1].z + this.vertices[2].z) ;
        const length = Math.sqrt(x * x + y * y + z * z);
        x = x / length * 6371010;
        y = y / length * 6371010;
        z = z / length * 6371010;
        //console.log("x after normalization:", x);
        return new Cesium.Cartesian3(x, y, z);
    }
}

// Make it globally available
window.FacesGeoPositions = FacesGeoPositions;