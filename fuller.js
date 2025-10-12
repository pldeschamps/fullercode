// fuller.js

window.fullerData = {}; // Objet global pour partager les données

fetch("icosaedre.json")
    .then(response => response.json())
    .then(data => {
        // Création des sommets
        const verts = {};
        data.vertices.forEach(v => {
            const pt = new GeoPoint(v.id, v.lat, v.lon);
            verts[v.id] = Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 0);
            viewer.entities.add({
                position: verts[v.id],
                point: { pixelSize: 3, color: Cesium.Color.MAGENTA },
                label: { text: v.id.toString(), font: "24px sans-serif", pixelOffset: new Cesium.Cartesian2(0, -12) }
            });
        });

        // Création des positions pour chaque face (tableau de FacesGeoPositions)
        const facesGeoPositions = data.faces.map(face => {
            const positions = face.vertices.map(id =>
                Cesium.Cartesian3.fromDegrees(
                    data.vertices.find(v => v.id === id).lon,
                    data.vertices.find(v => v.id === id).lat,
                    0
                )
            );
            
            console.log(face.subtrianglesids);
            return new FaceGeoPositions(face.id, positions, face.subtrianglesids);
        });

        // Stockage dans l'objet global
        window.fullerData.facesGeoPositions = facesGeoPositions;
        //Stockage d'un tableau de tableaux de Cesium.Cartesian3 pour Cesium
        window.fullerData.facesPositions = facesGeoPositions.map(faceObj => faceObj.vertices);
        window.fullerData.viewer = viewer; // Pour accès dans cesium.js

        // Optionally, add the center as a point entity for visualization
        facesGeoPositions.forEach(faceObj => {
            viewer.entities.add({
                position: faceObj.center,
                //point: { pixelSize: 10, color: Cesium.Color.YELLOW },
                label: {
                    text: `${faceObj.faceId}`, font: "48px sans-serif",
                    fillColor: Cesium.Color.MAGENTA.withAlpha(0.5)               }
            });
        });
    });