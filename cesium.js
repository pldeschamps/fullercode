// cesium.js

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.

//Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MDk0NDgwMS03NmEzLTQ0MzQtOTc3Ny02MmNmNDg2ZGY3MTUiLCJpZCI6MzQ1MTMzLCJpYXQiOjE3NTg5OTA0MTN9.1aWmnRsHn8Z70pU5B7gJhQOLrarcr4SGf6GxTuPB0Xs';
Cesium.Ion.defaultAccessToken = null;

// const naturalEarthProvider = await Cesium.TileMapServiceImageryProvider.fromUrl(
//   Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII")
// );
const osm = new Cesium.OpenStreetMapImageryProvider({
    url : 'https://tile.openstreetmap.org/'
});
window.viewer = new Cesium.Viewer('cesiumContainer', {
    // baseLayer: Cesium.ImageryLayer.fromProviderAsync(
    //     Cesium.TileMapServiceImageryProvider.fromUrl(
    //         Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
    //     ),
    // ),
    imageryProvider: osm,
    animation: false,
    timeline: false,
    geocoder: false,
    skyBox: false,
    skyatmosphere: false,
    sun: false,
    moon: false,
});
window.viewer.imageryLayers.addImageryProvider(osm);
//window.viewer.imageryLayers.raiseToTop(osm);
const cameraLabel = document.createElement("div");
cameraLabel.id = "cameraWidget";
cameraLabel.textContent = "Lat: -- | Lon: -- | Alt: --";
window.viewer.container.appendChild(cameraLabel);
const fullerCodeLabel = document.createElement("div");
fullerCodeLabel.id = "fullerCodeWidget";
fullerCodeLabel.textContent = "fullercode: ";
window.viewer.container.appendChild(fullerCodeLabel);

window.scene = window.viewer.scene;
// window.scene.globe.show = true;
// window.scene.globe.baseColor = Cesium.Color.darkblue;

// test to show Natural Earth II layer even in high alitude on mobile
const layer = window.viewer.imageryLayers.get(0);
  layer.show = true;
  layer.alpha = 1.0;
  layer.brightness = 1.2;

  // 👇 désactive la coupure d’affichage aux grandes distances
  layer.minificationFilter = Cesium.TextureMinificationFilter.LINEAR;
  layer.magnificationFilter = Cesium.TextureMagnificationFilter.LINEAR;


window.viewer.scene.screenSpaceCameraController.enableTilt = false
window.entities = window.viewer.entities;
window.LevelHeights = [6500000, 2600000, 1000000, 200000, 100000,10000,1800,700,170,50];
window.triangles = []; // To store subdivided triangles

const entitiesLevels = [];
var level0 = viewer.entities.add(new Cesium.Entity());
entitiesLevels.push(level0);
var level1 = viewer.entities.add(new Cesium.Entity());
entitiesLevels.push(level1);
let addedSub = [];
// Attendre que fuller.js ait charg� les donn�es
document.addEventListener("DOMContentLoaded", () => {
    // Attendre que le JSON soit charg� (sinon facesPositions sera undefined)
    const interval = setInterval(() => {
        if (window.fullerData && window.fullerData.facesPositions) {
            addPolygons(window.fullerData.facesGeoPositions,entitiesLevels[0]);
            clearInterval(interval);
        }
    }, 100);
});

// Listen for camera changes
window.viewer.camera.changed.addEventListener(findClosestFaceCenter);
// Listen for camera changes
window.viewer.camera.changed.addEventListener(updateCameraLabel);

// Initial update
updateCameraLabel();

function addPolygons(facesGeoPositions,parentEntity) {
//    const facesPositions = window.fullerData.facesPositions;
    const viewer = window.fullerData.viewer;
    if (!facesGeoPositions || !viewer) return;
    
    //facesPositions.forEach(positions => {
    //    addPolygon(positions);
    console.log("A: ",facesGeoPositions[1].vertices);
    console.log("C: ",facesGeoPositions[0].vertices);
    facesGeoPositions.forEach(faceObj => {
        addPolygon(faceObj.vertices, faceObj.faceId, parentEntity, faceObj.center);
        window.triangles.push(faceObj);
    });
}
function addPolygon(positions, triangleId, parentEntity,center) {
    
    viewer.entities.add({
        id: "triangle "+triangleId,
        parent: parentEntity,
            polygon: {
                hierarchy: positions,
                height: 1,
                material: Cesium.Color.BLUE.withAlpha(0.05),
                outline: true,
                outlineWidth: 5,
                outlineColor: Cesium.Color.MAGENTA
            }
    });
    const labelFont = (32 - triangleId.length).toString()+"px Consolas";
    viewer.entities.add({
        id: "label " + triangleId,
        parent: parentEntity,
        position: center,
        //point: { pixelSize: 10, color: Cesium.Color.YELLOW },
        label: {
            text: `${triangleId}`, font: labelFont,
            fillColor: Cesium.Color.MAGENTA.withAlpha(0.9),
            heightReference: 1
        }
    });
    }

// Camera change event to update lat/lon label
function updateCameraLabel() {

    const viewer = window.fullerData.viewer;
    const cameraCartographic = viewer.camera.positionCartographic;

    const cameraCartesian = Cesium.Cartesian3.fromRadians(
        cameraCartographic.longitude,
        cameraCartographic.latitude,
        cameraCartographic.height
    );
    const lat = Cesium.Math.toDegrees(cameraCartographic.latitude).toFixed(6);
    const lon = Cesium.Math.toDegrees(cameraCartographic.longitude).toFixed(6);
    console.log("Camera Lat: ", lat, " Lon: ", lon, " Alt: ", cameraCartographic.height.toFixed(2));
    cameraLabel.textContent =
        `Camera: lat ${lat}, 
        lon ${lon}, alt ${cameraCartographic.height.toFixed(0)}`;


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
        0
    );
    const levelIndex = getLevelIndex(cameraCartographic.height);
    console.log("levelIndex: ", levelIndex);
    console.log("entitiesLevels.length: ", entitiesLevels.length);

    //create levels if not exist
    for (let i = entitiesLevels.length; i <= levelIndex; i++) {
        console.log("Creating level:", i);
        var level = viewer.entities.add(new Cesium.Entity());
        entitiesLevels.push(level);

    }
    //hide all levels except current
    for (let i = 0; i < entitiesLevels.length; i++) {
        entitiesLevels[i].show = (i === levelIndex);
    //    console.log("Show: ", i);
    //    console.log("show: ", i === levelIndex);
    }


    let minDist = Number.POSITIVE_INFINITY;
    let secondMinDist = Number.POSITIVE_INFINITY;
    let closestFace = null;
    let secondClosestFace = null;

    facesGeoPositions.forEach(faceObj => {
        const dist = Cesium.Cartesian3.distance(cameraCartesian, faceObj.center);
        if (dist < secondMinDist) {
            if (dist < minDist) {
                secondMinDist = minDist;
                secondClosestFace = closestFace;
                minDist = dist;
                closestFace = faceObj;
            } else {
                secondMinDist = dist;
                secondClosestFace = faceObj;
            }
        }
    });
    //check, at each level, if the two closest subtriangles are already added
    for (let i = 0; i < levelIndex; i++) {

        let alreadyAdded = addedSub.includes(closestFace.faceId);
        //console.log("closestFace: ", closestFace.faceId);
        //console.log("alreadyAdded: ", alreadyAdded);
        let st;
        if (closestFace && !alreadyAdded) {
            addedSub.push(closestFace.faceId);
            st = new Subtriangles(closestFace);
            console.log("st A: ", st.subFaces[1].vertices);
            addPolygons(st.subFaces, entitiesLevels[i+1]);
        }
        alreadyAdded = addedSub.includes(secondClosestFace.faceId);
        if (secondClosestFace && !alreadyAdded) {
            addedSub.push(secondClosestFace.faceId);
            st = new Subtriangles(secondClosestFace);
            addPolygons(st.subFaces, entitiesLevels[i+1]);
        }
        //find the next closest face for the next level
        let nextMinDist = Number.POSITIVE_INFINITY;
        let nextClosestFace = null;
        let nextSecondMinDist = Number.POSITIVE_INFINITY;
        let nextSecondClosestFace = null;
        window.triangles.forEach(faceObj => {
            if (faceObj.faceId.startsWith(closestFace.faceId) && faceObj.faceId.length === closestFace.faceId.length + 1
                || faceObj.faceId.startsWith(secondClosestFace.faceId) && faceObj.faceId.length === secondClosestFace.faceId.length + 1) {
                //console.log("faceObj.faceId: ", faceObj.faceId);
                const dist = Cesium.Cartesian3.distance(cameraCartesian, faceObj.center);
                //console.log("dist: ", dist);

                //if (dist < nextMinDist && dist > minDist) {
                if (dist < nextSecondMinDist ) {
                    if (dist < nextMinDist) {
                        nextSecondMinDist = nextMinDist;
                        nextSecondClosestFace = nextClosestFace;
                        nextMinDist = dist;
                        nextClosestFace = faceObj;
                    } else {
                        nextSecondMinDist = dist;
                        nextSecondClosestFace = faceObj;
                    }
                }
                
            }
        }

        );
        minDist = nextMinDist;
        secondMinDist = nextSecondMinDist;
        closestFace = nextClosestFace;
        secondClosestFace = nextSecondClosestFace;
        fullerCodeLabel.textContent =
        `fullercode: ${closestFace.faceId}`; 
        console.log("closest: ", closestFace.faceId);
        console.log("second closest: ", secondClosestFace.faceId);
    }
}

function getLevelIndex(height) {
    const levels = window.LevelHeights;

    for (let i = 0; i < levels.length; i++) {
        if (height >= levels[i]) {
            return i; // Plus grand ou �gal � ce niveau
        }
    }

    // Si plus petit que tous les niveaux
    return levels.length;
}

