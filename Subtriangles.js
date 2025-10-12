class Subtriangles {
    constructor(faceGeoPos) {
        this.faceGeoPos = faceGeoPos;
        this.a = this.faceGeoPos.vertices[0];
        this.b = this.faceGeoPos.vertices[1];
        this.c = this.faceGeoPos.vertices[2];

        // First-level midpoints
        this.ab = Subtriangles.midpoint(this.a, this.b);
        this.bc = Subtriangles.midpoint(this.b, this.c);
        this.ac = Subtriangles.midpoint(this.a, this.c);

        // Second-level midpoints
        this.ac_ab = Subtriangles.midpoint(this.ac, this.ab);
        this.ab_bc = Subtriangles.midpoint(this.ab, this.bc);
        this.bc_ac = Subtriangles.midpoint(this.bc, this.ac);

        this.a_ab = Subtriangles.midpoint(this.a, this.ab);
        this.ab_b = Subtriangles.midpoint(this.ab, this.b);
        this.b_bc = Subtriangles.midpoint(this.b, this.bc);
        this.bc_c = Subtriangles.midpoint(this.bc, this.c);
        this.c_ac = Subtriangles.midpoint(this.c, this.ac);
        this.ac_a = Subtriangles.midpoint(this.ac, this.a);
        //  strangely, the following point is not equal to this.ab_bc
        //  this.ac_ab_b_bc = Subtriangles.midpoint(this.ac_ab, this.b_bc);
        // Why is this.ac_ab_b_bc != this.ab_bc ?

        const ids = faceGeoPos.subtrianglesIds.split('');
        // Define 16 subtriangles (each as a FacesGeoPositions)
        this.subFaces = [
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[0], [this.ac_ab, this.ab_bc, this.bc_ac], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[1], [this.a, this.a_ab, this.ac_a], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[2], [this.ac_ab, this.ac_a, this.a_ab], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[3], [this.a_ab, this.ab, this.ac_ab], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[4], [this.ab_bc, this.ac_ab, this.ab], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[5], [this.ab, this.ab_bc, this.ab_b], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[6], [this.ab_b, this.b, this.b_bc], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[7], [this.b_bc, this.ab_bc, this.ab_b], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[8], [this.ab_bc, this.b_bc, this.bc], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[9], [this.bc, this.bc_ac, this.ab_bc], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[10], [this.bc_ac, this.bc, this.b_bc], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[11], [this.c_ac, this.bc_c, this.c], faceGeoPos.subtrianglesIds),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[6], [this.ab_b, this.b, this.b_bc], faceGeoPos.subtrianglesIds),
        //    new FacesGeoPositions(this.faceGeoPos.faceId+ids[6], [pts.ab, pts.ab_b, pts.ab_bc]),
        //    new FacesGeoPositions(this.faceGeoPos.faceId+ids[7], [pts.ab_b, pts.b, pts.b_bc]),
        //    new FacesGeoPositions(this.faceGeoPos.faceId+ids[8], [pts.ab_bc, pts.b_bc, pts.bc_ac]),
        //    new FacesGeoPositions(this.faceGeoPos.faceId+ids[9], [pts.bc_ac, pts.b_bc, pts.bc]),
        //    new FacesGeoPositions(this.faceGeoPos.faceId+ids[10], [pts.ac, pts.bc_ac, pts.c_ac]),
        //    new FacesGeoPositions(this.faceGeoPos.faceId+ids[11], [pts.bc_ac, pts.bc_c, pts.c_ac]),
        //    new FacesGeoPositions(this.faceGeoPos.faceId+ids[12], [pts.c_ac, pts.bc_c, pts.c]),
        //    new FacesGeoPositions(this.faceGeoPos.faceId+ids[13], [pts.ab_bc, pts.bc_ac, pts.bc_c]),
        //    new FacesGeoPositions(this.faceGeoPos.faceId+ids[14], [pts.ab_bc, pts.bc_c, pts.b_bc]),
        //    new FacesGeoPositions(this.faceGeoPos.faceId+ids[15], [pts.b_bc, pts.bc_c, pts.c])
        ];
    }

    // Static method to compute the midpoint between two Cesium.Cartesian3 points, normalized to the sphere
    static midpoint(p1, p2, radius = 6371010) {
        const x = p1.x + p2.x;
        const y = p1.y + p2.y;
        const z = p1.z + p2.z;
        const length = Math.sqrt(x * x + y * y + z * z);
        return new Cesium.Cartesian3(
            (x / length) * radius,
            (y / length) * radius,
            (z / length) * radius
        );
    }
}

// Make it globally available
window.Subtriangles = Subtriangles;