// cesium.js

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.


window.viewer = new Cesium.Viewer('cesiumContainer', {});
window.scene = window.viewer.scene;
window.entities = window.viewer.entities;

function addPolygons() {
    const facesPositions = window.fullerData.facesPositions;
    const viewer = window.fullerData.viewer;
    if (!facesPositions || !viewer) return;

    facesPositions.forEach(positions => {
        viewer.entities.add({
            polygon: {
                hierarchy: positions,
                height: 1,
                material: Cesium.Color.BLUE.withAlpha(0.01),
                outline: true,
                outlineWidth: 10,
                outlineColor: Cesium.Color.GREEN.withAlpha(0.99)
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