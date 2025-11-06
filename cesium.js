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

const fullerCodeInput = document.createElement("input");
fullerCodeInput.id = "fullerCodeInput";
fullerCodeInput.type = "text";
fullerCodeInput.placeholder = "Enter fullercode...";
window.viewer.container.appendChild(fullerCodeInput);
let cameraHeight = 100000;
// Enforce uppercase and allowed-character rules:
// - first character allowed set: "CM3FA2H5PX9V8TR7NSJK"
// - following characters allowed set: "CM3FA2H5PX9V8TR7"
const MAX_FULLERCODE_LEN = 12;
const ALLOWED_FIRST = "CM3FA2H5PX9V8TR7NSJK";
const ALLOWED_REST = "CM3FA2H5PX9V8TR7";
fullerCodeInput.maxLength = MAX_FULLERCODE_LEN;
fullerCodeInput.addEventListener('input', function (e) {
    // force uppercase and filter invalid characters
    const raw = (this.value || '').toUpperCase();
    let filtered = '';
    for (let i = 0; i < raw.length && filtered.length < MAX_FULLERCODE_LEN; i++) {
        const ch = raw[i];
        if (i === 0) {
            if (ALLOWED_FIRST.indexOf(ch) !== -1) filtered += ch;
        } else {
            if (ALLOWED_REST.indexOf(ch) !== -1) filtered += ch;
        }
    }

    // If filtering removed or changed characters, update the input value
    if (this.value !== filtered) {
        this.value = filtered;
    }

    // adjust camera height heuristically based on code length (keeps previous behaviour)
    if (filtered.length > 1) {
        const idx = Math.min(filtered.length - 1, window.LevelHeights.length - 1);
        const prevIdx = Math.max(filtered.length - 2, 0);
        cameraHeight = (window.LevelHeights[idx] + window.LevelHeights[prevIdx]) / 2;
    }  else {
        cameraHeight = 7000000; // default
    }
});

fullerCodeInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const code = this.value.trim();
        if (code.length>0) {
            // Find the triangle with matching fullercode
            let targetTriangle = window.triangles.find(t => t.faceId === code);
            if(!targetTriangle){
                createLevels(code.length); // code.length-2 ?
                for (let i=1; i<=code.length; i++){
                    console.log("Creating subtriangle for: ", code.substring(0,i));
                    const subTriangle = window.triangles.find(t => t.faceId === code.substring(0,i));
                    console.log("subTriangle: ", subTriangle);
                    addSubtriangles(subTriangle, i-1);
                }
            }
            targetTriangle = window.triangles.find(t => t.faceId === code);
            if (targetTriangle) {
                // Convert center position to get latitude and longitude
                const cartographic = Cesium.Cartographic.fromCartesian(targetTriangle.center);
                const destinationPosition = Cesium.Cartesian3.fromRadians(
                    cartographic.longitude,
                    cartographic.latitude,
                    cameraHeight // Setting height to 100km
                );
                // Move camera to the target triangle's center with specified height
                window.viewer.camera.flyTo({
                    destination: destinationPosition,
                    orientation: {
                        heading: 0.0,
                        pitch: -Cesium.Math.PI_OVER_TWO,
                        roll: 0.0
                    }
                });
            } else {
                console.log('Fullercode not found:', code);
            }
        }
    }
});

window.scene = window.viewer.scene;

// Parse a fullercode from the URL and attempt to fly to it.
// Acceptable URL formats:
//  - https://example.com/?MAXTT5V
//  - https://example.com/@MAXTT5V
//  - any location containing '?CODE' or '/@CODE'
// function parseFullercodeFromUrl() {
//     const MAX = MAX_FULLERCODE_LEN;
//     // try search/query (e.g. ?MAXTT5V or ?code=MAXTT5V)
//     let code = null;
//     if (window.location.search && window.location.search.length > 1) {
//         // If search is like ?MAXTT5V (no key), take substring after '?'
//         const raw = window.location.search.substring(1);
//         // If there's an '=' then it's a normal query param; look for a value that looks like a code
//         if (raw.indexOf('=') === -1) {
//             code = raw.split('&')[0];
//         } else {
//             // find any value that matches permitted characters
//             const pairs = raw.split('&');
//             for (const p of pairs) {
//                 const parts = p.split('=');
//                 if (parts.length === 2 && parts[1]) {
//                     // use the value if it contains only allowed chars (after uppercasing)
//                     const val = parts[1].toUpperCase().replace(/[^A-Z0-9]/g,'');
//                     if (val.length > 0) { code = val; break; }
//                 }
//             }
//         }
//     }

//     // try path style like /@MAXTT5V or any '@' in the href
//     if (!code) {
//         const href = window.location.href;
//         const atIndex = href.indexOf('/@');
//         const at2 = href.indexOf('@');
//         let idx = -1;
//         if (atIndex !== -1) idx = atIndex + 2; // after '/@'
//         else if (at2 !== -1) idx = at2 + 1; // after '@'
//         if (idx !== -1) {
//             // take up to MAX characters, stop at slash, questionmark, ampersand or end
//             let substr = href.substring(idx);
//             const stop = substr.search(/[\/?&#]/);
//             if (stop !== -1) substr = substr.substring(0, stop);
//             code = substr;
//         }
//     }

//     if (!code) return null;
//     code = code.toUpperCase().replace(/[^A-Z0-9]/g,'').substring(0, MAX);
//     return code;
// }

// function tryFlyToCodeFromUrl() {
//     const code = parseFullercodeFromUrl();
//     if (!code) return;
//     console.log('Found code in URL:', code);
//     // Put code into input (this will be filtered/validated by input handler)
//     fullerCodeInput.value = code;
//     fullerCodeInput.dispatchEvent(new Event('input', { bubbles: true }));

//     // Try to fly when triangles are available. Retry a few times if necessary.
//     let attempts = 0;
//     const maxAttempts = 50; // ~5 seconds at 100ms
//     const iv = setInterval(() => {
//         attempts++;
//         if (window.triangles && window.triangles.length > 0) {
//             clearInterval(iv);
//             const target = window.triangles.find(t => t.faceId === fullerCodeInput.value);
//             if (target) {
//                 console.log('Flying to code from URL:', fullerCodeInput.value);
//                 // reuse cameraHeight computed by input handler
//                 const cartographic = Cesium.Cartographic.fromCartesian(target.center);
//                 const destinationPosition = Cesium.Cartesian3.fromRadians(
//                     cartographic.longitude,
//                     cartographic.latitude,
//                     cameraHeight
//                 );
//                 window.viewer.camera.flyTo({ destination: destinationPosition, orientation: { heading: 0.0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0.0 } });
//             } else {
//                 console.log('Fullercode from URL not found among loaded triangles:', fullerCodeInput.value);
//             }
//         } else if (attempts >= maxAttempts) {
//             clearInterval(iv);
//             console.log('Timed out waiting for triangles to load to fly to URL code.');
//         }
//     }, 100);
// }

// Run once at load
// tryFlyToCodeFromUrl();
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
window.LevelHeights = [6500000, 2600000, 1000000, 200000, 100000,10000,1800,700,170,50,10];
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
    createLevels(levelIndex);
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

        
        addSubtriangles(closestFace, i);
        addSubtriangles(secondClosestFace, i);
        
        //find the next closest faces for the next level
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

function addSubtriangles(closestFace, i) {
    let alreadyAdded;
    alreadyAdded = addedSub.includes(closestFace.faceId);
    //console.log("closestFace: ", closestFace.faceId);
    //console.log("alreadyAdded: ", alreadyAdded);
    if (closestFace && !alreadyAdded) {
        addedSub.push(closestFace.faceId);
        let st;
        st = new Subtriangles(closestFace);
        console.log("st A: ", st.subFaces[1].vertices);
        addPolygons(st.subFaces, entitiesLevels[i + 1]);
    }
}

function createLevels(levelIndex) {
    const viewer = window.fullerData.viewer;
    for (let i = entitiesLevels.length; i <= levelIndex; i++) {
        console.log("Creating level:", i);
        var level = viewer.entities.add(new Cesium.Entity());
        entitiesLevels.push(level);

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

