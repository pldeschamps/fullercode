// cesium.js

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.

//Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MDk0NDgwMS03NmEzLTQ0MzQtOTc3Ny02MmNmNDg2ZGY3MTUiLCJpZCI6MzQ1MTMzLCJpYXQiOjE3NTg5OTA0MTN9.1aWmnRsHn8Z70pU5B7gJhQOLrarcr4SGf6GxTuPB0Xs';
Cesium.Ion.defaultAccessToken = null;
window.viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayer: Cesium.ImageryLayer.fromProviderAsync(
        Cesium.TileMapServiceImageryProvider.fromUrl(
            Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
        ),
    ),
    animation: false,
    timeline: false,
    geocoder: false,
    skyBox: false,
    skyatmosphere: false,
    sun: false,
    moon: false,
});
window.scene = window.viewer.scene;
window.entities = window.viewer.entities;

let addedSub = [];
// Attendre que fuller.js ait chargé les données
document.addEventListener("DOMContentLoaded", () => {
    // Attendre que le JSON soit chargé (sinon facesPositions sera undefined)
    const interval = setInterval(() => {
        if (window.fullerData && window.fullerData.facesPositions) {
            addPolygons(window.fullerData.facesPositions);
            clearInterval(interval);
        }
    }, 100);
});


function addPolygons(facesPositions) {
//    const facesPositions = window.fullerData.facesPositions;
    const viewer = window.fullerData.viewer;
    if (!facesPositions || !viewer) return;
    console.log("positions:", typeof facesPositions);
    
    facesPositions.forEach(positions => {
        console.log("positions:", positions[0].x.toString());
        addPolygon(positions);
    });
}
function addPolygon(positions) {
    
        console.log("positions:", positions[0].x.toString());
        viewer.entities.add({
            polygon: {
                hierarchy: positions,
                height: 10,
                material: Cesium.Color.BLUE.withAlpha(0.05),
                outline: true,
                outlineWidth: 10,
                outlineColor: Cesium.Color.MAGENTA
            }
        });
    }

function addSubtriangle(fgp) {
    const viewer = window.fullerData.viewer;
    if (!fgp || !viewer) return;
    console.log("subtriangle: ", typeof fgp.vertices);
    //window.fullerData.facesPositions = facesGeoPositions.map(faceObj => faceObj.vertices);
    const fsps = fgp.map(faceObj => faceObj.vertices);

    fsps.forEach(positions => {
        console.log("positions:", positions[0].x.toString());
        addPolygon(positions);
    });
}



// Camera change event to update lat/lon label
function updateCameraLabel() {
    console.log("Updating camera label");   
    const camera = window.viewer.camera;
    const cartesian = camera.positionWC;
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
    const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
    const altitude = cartographic.height.toFixed(2);
    document.getElementById("cameraLabel").innerText =
        `Camera: lat ${lat}, lon ${lon}, alt ${altitude}`;
}

function findClosestFaceCenter() {
    const viewer = window.fullerData.viewer;
    const facesGeoPositions = window.fullerData.facesGeoPositions;
    if (!viewer || !facesGeoPositions) return;

    // Get camera position in Cartesian3
    const cameraCartographic = viewer.camera.positionCartographic;
    const cameraCartesian = Cesium.Cartesian3.fromRadians(
        cameraCartographic.longitude,
        cameraCartographic.latitude,
        cameraCartographic.height
    );

    // Only proceed if camera height is below 6,500,000
    if (cameraCartographic.height < 6500000) {
        let minDist = Number.POSITIVE_INFINITY;
        let closestFace = null;

        facesGeoPositions.forEach(faceObj => {
            const dist = Cesium.Cartesian3.distance(cameraCartesian, faceObj.center);
            if (dist < minDist) {
                minDist = dist;
                closestFace = faceObj;
            }
        });
        console.log(addedSub[0]);
        const alreadyAdded = addedSub.includes(closestFace.faceId);
        if (closestFace && !alreadyAdded) {
            addedSub.push(closestFace.faceId);
            const st = new Subtriangles(closestFace);
            const fsps = st.subFaces.map(faceObj => faceObj.vertices);
            addPolygons(fsps);

            st.subFaces.forEach(faceObj => {
                viewer.entities.add({
                    position: faceObj.center,
                    //point: { pixelSize: 10, color: Cesium.Color.YELLOW },
                    label: {
                        text: `${faceObj.faceId}`, font: "48px sans-serif",
                        fillColor: Cesium.Color.MAGENTA.withAlpha(0.5)
                    }
                });
            });
            //st.subFaces.forEach(sub => {
            //    addSubtriangle(sub);
            //});
            console.log(`Closest face: ${closestFace.faceId}, distance: ${minDist}`);
            // You can also update a label or UI here if needed
        }
    }
}

// Listen for camera changes
window.viewer.camera.changed.addEventListener(findClosestFaceCenter);
// Listen for camera changes
window.viewer.camera.changed.addEventListener(updateCameraLabel);

// Initial update
updateCameraLabel();