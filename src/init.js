import './ConstrucTAOSurfaceShader.js'
import loadLabels from './loadLabels.js'
import loadAsset from './loadAsset.js'
import displayBillboardOnClick from './displayBillboardOnClick.js'

import './dom-ui.js'

export default function init() {
  const { Color, Vec3, Xfo, Scene, GLRenderer, EnvMap, resourceLoader, TreeItem, Lines, Material, GeomItem } = zeaEngine
  const { CADBody } = zeaCad

  const urlParams = new URLSearchParams(window.location.search)

  // //////////////////////////////////////////////////////
  // Scene and Renderer
  const scene = new Scene()
  scene.setupGrid(10.0, 10)

  const renderer = new GLRenderer(document.getElementById('canvas'), {
    debugGeomIds: false,
    enableFrustumCulling: true,
  })
  // renderer.solidAngleLimit = 0.0;
  renderer.setScene(scene)
  renderer.getViewport().getCamera().setPositionAndTarget(new Vec3(5, -5, 5), new Vec3(0, 0, 1.5))

  globalThis.renderer = renderer

  const envMap = new EnvMap()
  envMap.load('../data/StudioG.zenv')
  scene.setEnvMap(envMap)

  // //////////////////////////////////////////
  // Setup Selection Manager.

  const { SelectionManager, ToolManager, DomTree } = zeaUx
  const appData = {
    renderer,
    scene,
  }
  const selectionManager = new SelectionManager(appData, {
    selectionOutlineColor: new Color(1, 1, 0.2, 0.1),
    branchSelectionOutlineColor: new Color(1, 1, 0.2, 0.1),
  })
  // const cameraTool = renderer.getViewport().getManipulator();
  // const toolManager = new ToolManager(appData);
  // renderer.getViewport().setManipulator(toolManager);
  // toolManager.registerTool("Camera Tool", cameraTool);
  // toolManager.pushTool("Camera Tool");

  // //////////////////////////////////////////
  // UI Elements

  // Setup FPS Display
  const fpsElement = document.getElementById('fps')
  fpsElement.renderer = renderer

  // Setup TreeView Display
  const treeElement = document.getElementById('tree')
  treeElement.setTreeItem(scene.getRoot(), selectionManager)

  let highlightedItem
  const highlightColor = new Color('#F9CE03')
  highlightColor.a = 0.1
  const filterItem = (item) => {
    while (item && !(item instanceof CADBody)) item = item.getOwner()
    return item
  }
  // renderer.getViewport().on('pointerOverGeom', (event) => {
  //   // highlightedItem = filterItem(event.intersectionData.geomItem);
  //   event.intersectionData.geomItem.addHighlight('pointerOverGeom', highlightColor, true)
  // })
  // renderer.getViewport().on('pointerLeaveGeom', (event) => {
  //   event.leftGeometry.removeHighlight('pointerOverGeom', true)
  //   highlightedItem = null
  // })

  scene.getRoot().on('pointerEnter', (event) => {
    highlightedItem = filterItem(event.intersectionData.geomItem)
    event.intersectionData.geomItem.addHighlight('pointerOverGeom', highlightColor, true)
  })
  scene.getRoot().on('pointerLeave', (event) => {
    event.leftGeometry.removeHighlight('pointerOverGeom', true)
    highlightedItem = null
  })
  scene.getRoot().on('pointerMove', (event) => {
    if (event.intersectionData && event.pointerType == 'xr') {
      const controller = event.controller
      const pointerItem = controller.tipItem.getChild(0)
      const pointerXfo = pointerItem.localXfoParam.value
      pointerXfo.sc.z = event.intersectionData.dist / controller.xrvp.stageScale
      pointerItem.localXfoParam.value = pointerXfo
    }
  })
  scene.getRoot().on('pointerLeave', (event) => {
    if (!event.intersectionData && event.pointerType == 'xr') {
      const controller = event.controller
      const pointerItem = controller.tipItem.getChild(0)
      const pointerXfo = pointerItem.localXfoParam.value
      pointerXfo.sc.z = controller.raycastDist
      pointerItem.localXfoParam.value = pointerXfo
    }
  })

  let pointerDownPos
  renderer.getViewport().on('pointerDown', (event) => {
    const { intersectionData } = event
    if (intersectionData) {
      pointerDownPos = event.pointerPos
    }
  })
  renderer.getViewport().on('pointerUp', (event) => {
    const { intersectionData } = event
    if (intersectionData && pointerDownPos) {
      // const geomItem = filterItem(intersectionData.geomItem);
      // console.log(geomItem.getPath());
      const dist = event.pointerPos.distanceTo(pointerDownPos)
      if (dist < 2 && event.button == 0 && intersectionData && intersectionData.geomItem.hasParameter('LayerName')) {
        displayBillboardOnClick(intersectionData, labelsData, billboards)
        event.stopPropagation()
      }
    }
  })

  resourceLoader.on('progressIncremented', (event) => {
    const pct = document.getElementById('progress')
    pct.value = event.percent
    if (event.percent >= 100) {
      setTimeout(() => pct.classList.add('hidden'), 1000)
    }
  })

  renderer.getXRViewport().then((xrvp) => {
    fpsElement.style.bottom = '70px'

    const xrButton = document.getElementById('xr-button')
    xrButton.textContent = 'Launch VR'
    xrButton.classList.remove('hidden')

    xrvp.on('presentingChanged', (event) => {
      const { state } = event
      if (state) {
        xrButton.textContent = 'Exit VR'
      } else {
        xrButton.textContent = 'Launch VR'
      }
    })
    // xrvp.on('viewChanged', (event) => {
    //   console.log('VR Rendering', event.viewXfo.toString())
    // })

    xrvp.on('pointerDown', (event) => {
      const { intersectionData } = event
      if (intersectionData && intersectionData.geomItem.hasParameter('LayerName')) {
        displayBillboardOnClick(intersectionData, labelsData, billboards)

        // We can't stop propagation here, else the VRViewManipulator doesn't work.
        // (e.g. we have to avoid clicking on things do move, which means we
        // can't go inside the building.)
        // event.stopPropagation()
      }
    })

    xrButton.addEventListener('click', function (event) {
      xrvp.togglePresenting()
    })

    document.addEventListener('keydown', (event) => {
      if (event.key == ' ') {
        xrvp.togglePresenting()
      }
    })

    const line = new Lines()
    line.setNumVertices(2)
    line.setNumSegments(1)
    line.setSegmentVertexIndices(0, 0, 1)
    const positions = line.getVertexAttribute('positions')
    positions.getValueRef(0).set(0.0, 0.0, 0.0)
    positions.getValueRef(1).set(0.0, 0.0, -1.0)
    line.setBoundingBoxDirty()

    const pointermat = new Material('pointermat', 'LinesShader')
    pointermat.setSelectable(false)
    pointermat.getParameter('BaseColor').value = new Color(0.2, 1.0, 0.2)

    xrvp.on('controllerAdded', (event) => {
      const controller = event.controller

      controller.raycastDist = 20.0

      // Remove the green ball added by the VRViewManipulator.
      controller.tipItem.removeAllChildren()

      const pointerItem = new GeomItem('PointerRay', line, pointermat)
      pointerItem.setSelectable(false)
      const pointerXfo = new Xfo()
      pointerXfo.sc.set(1, 1, controller.raycastDist)
      pointerItem.localXfoParam.value = pointerXfo
      controller.tipItem.addChild(pointerItem, false)

      // The tip items needs to be rotated down a little to make it
      // point in the right direction.
      const tipItemXfo = controller.tipItem.localXfoParam.value
      tipItemXfo.ori.setFromAxisAndAngle(new Vec3(1, 0, 0), -0.8)
      controller.tipItem.localXfoParam.value = tipItemXfo
    })
  })

  if (urlParams.has('profile')) {
    renderer.startContinuousDrawing()
  }

  // //////////////////////////
  // Load the Labels
  const promisses = []
  const billboards = new TreeItem('Billboards')
  scene.getRoot().addChild(billboards)
  let labelsData
  loadLabels('./data/labels.xlsx').then((json) => {
    console.log(json)
    labelsData = json
  })

  // //////////////////////////
  // Load the Asset
  // const url = './data/data.skp.zcad'
  const url = './data/maison.skp.zcad'
  loadAsset(url).then((data) => {
    scene.getRoot().addChild(data.asset)
    scene.getRoot().addChild(data.layersRoot)
    renderer.frameAll()
  })

  const domUI = document.createElement('dom-ui')
  document.body.appendChild(domUI)

  // const tomTree = new DomTree('DomTree', domUI.contentDiv)

  // const localXfo = new Xfo()
  // localXfo.tr.set(10, 0, 3)
  // localXfo.ori.setFromAxisAndAngle(new Vec3(1, 0, 0), Math.PI * -0.5)
  // tomTree.getParameter('LocalXfo').setValue(localXfo)
  // tomTree.getParameter('PixelsPerMeter').setValue(200)
  // scene.getRoot().addChild(tomTree)
}
