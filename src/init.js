import "./ConstrucTAOSurfaceShader.js";
export default function init() {
  const {
    Color,
    Vec3,
    Scene,
    GLRenderer,
    EnvMap,
    resourceLoader,
    GeomItem,
    TreeItem,
    SelectionSet,
  } = zeaEngine;
  const { CADAsset, CADBody } = zeaCad;

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
  renderer.getViewport().on("pointerDown", (event) => {
    if (event.intersectionData) {
      const geomItem = filterItem(event.intersectionData.geomItem);
      console.log(geomItem.getPath());

      const material = event.intersectionData.geomItem
        .getParameter("Material")
        .getValue();
      console.log(material.getName());
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
  // Load the Asset
  const asset = new CADAsset();
  const zcad = urlParams.has("zcad")
    ? urlParams.get("zcad")
    : "./data/Projet%20construcTAU-2020.skp.zcad";
  if (zcad) {
    const layers = {};

    asset.load(zcad).then(() => {
      if (asset.hasParameter("LayerPaths")) {
        const LayerPaths = asset.getParameter("LayerPaths").getValue();
        LayerPaths.forEach((path) => {
          const parts = path.split(">");
          let item = scene.getRoot();
          parts.forEach((name, index) => {
            if (index == parts.length - 1) {
              if (layers[name]) {
                console.warn("Duplicte layer names found");
              }
              const layerItem = new SelectionSet(name);
              item.addChild(layerItem);
              layers[name] = layerItem;
            } else {
              let folderItem = item.getChildByName(name);
              if (!folderItem) {
                folderItem = new TreeItem(name);
                item.addChild(folderItem);
              }
              item = folderItem;
            }
          });
        });
      }

      let numItems = 0;
      let numGeomItem = 0;
      asset.traverse((item) => {
        numItems++;
        if (item instanceof GeomItem) {
          if (item.hasParameter("LayerName")) {
            const layerName = item.getParameter("LayerName").getValue();
            if (layers[layerName]) layers[layerName].addItem(item);
          }
          numGeomItem++;
        }
      });
      console.log("numItems:", numItems);
      const materials = asset.getMaterialLibrary().getMaterials();
      materials.forEach((material) => {
        material.setShaderName("ConstrucTAOSurfaceShader");
        const BaseColor = material.getParameter("BaseColor");
        if (BaseColor) BaseColor.setValue(BaseColor.getValue().toGamma());
        // console.log(material.getName(), material.getShaderName());

        switch (material.getName()) {
          case "Tyvek":
          case "[Sheet Metal]":
            material.getParameter("Overlay").setValue(0.05);
            break;
        }
      });
      renderer.frameAll();
    });
  }

  scene.getRoot().addChild(asset);
}
