import "./ConstrucTAOSurfaceShader.js";
import loadLabels from "./loadLabels.js";
import loadAsset from "./loadAsset.js";
import displayBillboardOnClick from "./displayBillboardOnClick.js";
export default function init() {
  const { Color, Vec3, Scene, GLRenderer, EnvMap, resourceLoader, TreeItem } =
    zeaEngine;
  const { CADBody } = zeaCad;

  const urlParams = new URLSearchParams(window.location.search);
  const scene = new Scene();
  scene.setupGrid(10.0, 10);

  const renderer = new GLRenderer(document.getElementById("canvas"), {
    debugGeomIds: false,
  });
  // renderer.solidAngleLimit = 0.0;
  renderer.setScene(scene);
  renderer
    .getViewport()
    .getCamera()
    .setPositionAndTarget(new Vec3(12, 12, 10), new Vec3(0, 0, 1.5));

  const envMap = new EnvMap();
  envMap.load("../data/StudioG.zenv");
  scene.setEnvMap(envMap);

  // Setup FPS Display
  const fpsElement = document.getElementById("fps");
  fpsElement.renderer = renderer;

  // Setup TreeView Display
  const treeElement = document.getElementById("tree");
  treeElement.setTreeItem(scene.getRoot());

  let highlightedItem;
  const highlightColor = new Color("#F9CE03");
  highlightColor.a = 0.1;
  const filterItem = (item) => {
    while (item && !(item instanceof CADBody)) item = item.getOwner();
    return item;
  };
  // renderer.getViewport().on("pointerOverGeom", (event) => {
  //   highlightedItem = filterItem(event.intersectionData.geomItem);
  //   highlightedItem.addHighlight("pointerOverGeom", highlightColor, true);
  // });
  // renderer.getViewport().on("pointerLeaveGeom", (event) => {
  //   highlightedItem.removeHighlight("pointerOverGeom", true);
  //   highlightedItem = null;
  // });

  let pointerDownPos;
  renderer.getViewport().on("pointerDown", (event) => {
    const { intersectionData } = event;
    if (intersectionData) {
      pointerDownPos = event.pointerPos;
    }
  });
  renderer.getViewport().on("pointerUp", (event) => {
    const { intersectionData } = event;
    if (intersectionData && pointerDownPos) {
      // const geomItem = filterItem(intersectionData.geomItem);
      // console.log(geomItem.getPath());
      const dist = event.pointerPos.distanceTo(pointerDownPos);
      if (
        dist < 2 &&
        event.button == 0 &&
        intersectionData &&
        intersectionData.geomItem.hasParameter("LayerName")
      ) {
        displayBillboardOnClick(intersectionData, labelsData, billboards);
      }
    }
  });

  resourceLoader.on("progressIncremented", (event) => {
    const pct = document.getElementById("progress");
    pct.value = event.percent;
    if (event.percent >= 100) {
      setTimeout(() => pct.classList.add("hidden"), 1000);
    }
  });

  renderer.getXRViewport().then((xrvp) => {
    fpsElement.style.bottom = "70px";

    const xrButton = document.getElementById("xr-button");
    xrButton.textContent = "Launch VR";
    xrButton.classList.remove("hidden");

    xrvp.on("presentingChanged", (event) => {
      const { state } = event;
      if (state) {
        xrButton.textContent = "Exit VR";
      } else {
        xrButton.textContent = "Launch VR";
      }
    });

    xrButton.addEventListener("click", function (event) {
      xrvp.togglePresenting();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key == " ") {
        xrvp.togglePresenting();
      }
    });
  });

  if (urlParams.has("profile")) {
    renderer.startContinuousDrawing();
  }

  // //////////////////////////
  // Load the Labels
  const promisses = [];
  const billboards = new TreeItem("Billboards");
  scene.getRoot().addChild(billboards);
  let labelsData;
  loadLabels("./data/labels.xlsx").then((json) => {
    console.log(json);
    labelsData = json;
  });

  // //////////////////////////
  // Load the Asset
  loadAsset("./data/Projet%20construcTAU-2020.skp.zcad").then((data) => {
    scene.getRoot().addChild(data.asset);
    scene.getRoot().addChild(data.layersRoot);
    renderer.frameAll();
  });
}
