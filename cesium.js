// cesium.js

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.


window.viewer = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    timeline: false
});
window.scene = window.viewer.scene;
window.entities = window.viewer.entities;


function addPolygons() {
    const facesPositions = window.fullerData.facesPositions;
    const viewer = window.fullerData.viewer;
    if (!facesPositions || !viewer) return;
    console.log("positions:", facesPositions.positions);
    facesPositions.forEach(positions => {
        viewer.entities.add({
            polygon: {
                hierarchy: positions,
                height: 10,
                material: Cesium.Color.BLUE.withAlpha(0.05),
                outline: true,
                outlineWidth: 10,
                outlineColor: Cesium.Color.GREEN
            }
        });
    });
}

// Attendre que fuller.js ait chargé les données
document.addEventListener("DOMContentLoaded", () => {
    // Attendre que le JSON soit chargé (sinon facesPositions sera undefined)
    const interval = setInterval(() => {
        if (window.fullerData && window.fullerData.facesPositions) {
            addPolygons();
            clearInterval(interval);
        }
    }, 100);
});
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

        if (closestFace) {
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