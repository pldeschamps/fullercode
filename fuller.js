// fuller.js

window.fullerData = {}; // Objet global pour partager les données

fetch("icosaedre.json")
    .then(response => response.json())
    .then(data => {
        // Création des sommets
        const verts = {};
        data.vertices.forEach(v => {
            const pt = new GeoPoint(v.id, v.lat, v.lon);
            //pt.computeXYZ();
            verts[v.id] = Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 0);
            viewer.entities.add({
                position: verts[v.id],
                point: { pixelSize: 8, color: Cesium.Color.RED },
                label: { text: v.id.toString(), font: "24px sans-serif", pixelOffset: new Cesium.Cartesian2(0, -12) }
            });
        });

        // Création des positions pour chaque face (tableau de GeoPoint)
        const facesGeoPoints = data.faces.map(face =>
            face.vertices.map(id => Cesium.Cartesian3.fromDegrees(
                data.vertices.find(v => v.id === id).lon,
                data.vertices.find(v => v.id === id).lat,
                10
            ))
        );

        // Stockage dans l'objet global
        window.fullerData.facesPositions = facesGeoPoints;
        window.fullerData.viewer = viewer; // Pour accès dans cesium.js
    });
