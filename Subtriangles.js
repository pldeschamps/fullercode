class Subtriangles {
    constructor(faceGeoPos) {
        this.faceGeoPos = faceGeoPos;
        this.a = this.faceGeoPos.vertices[0];
        this.b = this.faceGeoPos.vertices[1];
        this.c = this.faceGeoPos.vertices[2];

     // Naming convention for points and mid-points:
     //
     //                   0 (a)               
     //                   /\                  
     //                  /1 \                 
     //            ac_a /____\  a_ab          
     //                /\  2 /\               
     //               /15\  /3 \              
     //           ac /____\/____\  ab         
     //             /\ 14 /\  4 /\            
     //            /13\  /0 \  / 5\           
     //      c_ac /____\/____\/____\ ab_b     
     //          /\12  /\    /\    /\         
     //         /11\  /10\ 9/ 8\ 7/6 \        
     //        /____\/____\/____\/____\       
     //   (c) 2    bc_c    bc    b_bc   1 (b) 

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
        console.log(faceGeoPos.subtrianglesIds);

        // If faceGeoPos.faceId is one character long, faceGeoPos is a face of the icosahedron,
        // and subtrianglesIds should be named according to faceGeoPos.subtrianglesIds
        // But if faceGeoPos.faceId is longer than one character, faceGeoPos is already a subtriangle,
        // and subtrianglesIds should be named depending on their orientation within faceGeoPos
        // to prevent their last character from being the same as their neighbours'one.
        let ids = [];
        const up = true;
        const down = false;
        if (faceGeoPos.faceId.length > 1 && !facesGeoPos.parentOrientation) {
            // faceGeoPos is a down triangle, so we change the orientation of its subtriangles
            // according to the following Straight P-box mapping:
            pBox = [0, 2, 1, 8, 9, 10, 7, 6, 13, 14, 15, 12, 11, 3, 4, 5];
            for (let i = 0; i < 16; i++) {
                ids[i] = faceGeoPos.subtrianglesIds[pBox[i]];
            }
            up = false;
            down = true;

        } else {
            // faceGeoPos is an up triangle, so we keep the orientation of its subtriangles
            ids = faceGeoPos.subtrianglesIds.split('');
        }
        console.log(ids[0]);
        // Define 16 subtriangles (each as a FacesGeoPositions)
        this.subFaces = [
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[0], [this.ac_ab, this.ab_bc, this.bc_ac], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[1], [this.a, this.a_ab, this.ac_a], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[2], [this.ac_ab, this.ac_a, this.a_ab], faceGeoPos.subtrianglesIds,down),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[3], [this.a_ab, this.ab, this.ac_ab], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[4], [this.ab_bc, this.ac_ab, this.ab], faceGeoPos.subtrianglesIds,down),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[5], [this.ab, this.ab_bc, this.ab_b], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[6], [this.ab_b, this.b, this.b_bc], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[7], [this.b_bc, this.ab_bc, this.ab_b], faceGeoPos.subtrianglesIds,down),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[8], [this.ab_bc, this.b_bc, this.bc], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[9], [this.bc, this.bc_ac, this.ab_bc], faceGeoPos.subtrianglesIds,down),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[10], [this.bc_ac, this.bc, this.bc_c], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[11], [this.c_ac, this.bc_c, this.c], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[12], [this.bc_c, this.c_ac, this.bc_ac], faceGeoPos.subtrianglesIds,down),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[13], [this.ac, this.bc_ac, this.c_ac], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[14], [this.bc_ac, this.ac, this.ac_ab], faceGeoPos.subtrianglesIds,down),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[15], [this.ac_a, this.ac_ab, this.ac], faceGeoPos.subtrianglesIds,up)
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