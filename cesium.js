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
window.viewer.scene.screenSpaceCameraController.enableTilt = false
window.entities = window.viewer.entities;
var level0 = viewer.entities.add(new Cesium.Entity());
var level1 = viewer.entities.add(new Cesium.Entity());

let addedSub = [];
// Attendre que fuller.js ait chargé les données
document.addEventListener("DOMContentLoaded", () => {
    // Attendre que le JSON soit chargé (sinon facesPositions sera undefined)
    const interval = setInterval(() => {
        if (window.fullerData && window.fullerData.facesPositions) {
            addPolygons(window.fullerData.facesGeoPositions,level0);
            clearInterval(interval);
        }
    }, 100);
});


function addPolygons(facesGeoPositions,parentEntity) {
//    const facesPositions = window.fullerData.facesPositions;
    const viewer = window.fullerData.viewer;
    if (!facesGeoPositions || !viewer) return;
    
    //facesPositions.forEach(positions => {
    //    //console.log("positions:", positions[0].x.toString());
    //    addPolygon(positions);
    facesGeoPositions.forEach(faceObj => {
        addPolygon(faceObj.vertices, faceObj.faceId,parentEntity,faceObj.center);
    });
}
function addPolygon(positions, triangleId, parentEntity,center) {
    
        //console.log("positions:", positions[0].x.toString());
    viewer.entities.add({
        id: triangleId,
        parent: parentEntity,
            polygon: {
                hierarchy: positions,
                height: 10,
                material: Cesium.Color.BLUE.withAlpha(0.05),
                outline: true,
                outlineWidth: 10,
                outlineColor: Cesium.Color.MAGENTA
            }
    });
    viewer.entities.add({
        parent: parentEntity,
        position: center,
        //point: { pixelSize: 10, color: Cesium.Color.YELLOW },
        label: {
            text: `${triangleId}`, font: "48px sans-serif",
            fillColor: Cesium.Color.MAGENTA.withAlpha(0.5)
        }
    });
    }

// Camera change event to update lat/lon label
function updateCameraLabel() {
    //console.log("Updating camera label");

    const viewer = window.fullerData.viewer;
    const cameraCartographic = viewer.camera.positionCartographic;

    const cameraCartesian = Cesium.Cartesian3.fromRadians(
        cameraCartographic.longitude,
        cameraCartographic.latitude,
        cameraCartographic.height
    );
    const lat = Cesium.Math.toDegrees(cameraCartographic.latitude).toFixed(6);
    const lon = Cesium.Math.toDegrees(cameraCartographic.longitude).toFixed(6);
    document.getElementById("cameraLabel").innerText =
        `Camera: lat ${lat}, 
        lon ${lon}, alt ${cameraCartographic.height}`;


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
        console.log("hide level0, show level 1");
        level0.show = false;
        level1.show = true;
        console.log(addedSub[0]);
        const alreadyAdded = addedSub.includes(closestFace.faceId);
        if (closestFace && !alreadyAdded) {
            addedSub.push(closestFace.faceId);
            const st = new Subtriangles(closestFace);

            //const fsps = st.subFaces.map(faceObj => faceObj.vertices);
            //addPolygons(fsps);
            
            addPolygons(st.subFaces, level1);

            //st.subFaces.forEach(faceObj => {
            //    viewer.entities.add({
            //        position: faceObj.center,
            //        //point: { pixelSize: 10, color: Cesium.Color.YELLOW },
            //        label: {
            //            text: `${faceObj.faceId}`, font: "48px sans-serif",
            //            fillColor: Cesium.Color.MAGENTA.withAlpha(0.5)
            //        }
            //    });
            //});
            console.log(`Closest face: ${closestFace.faceId}, distance: ${minDist}`);
        }
        
    }
    else {
        console.log("show level0, hide level1");
        level0.show = true;
        level1.show = false;
    }
}

// Listen for camera changes
window.viewer.camera.changed.addEventListener(findClosestFaceCenter);
// Listen for camera changes
window.viewer.camera.changed.addEventListener(updateCameraLabel);

// Initial update
updateCameraLabel();