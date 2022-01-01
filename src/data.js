// <!-- prettier-ignore-start -->
import './ConstrucTAOSurfaceShader.js'
import loadAsset from './loadAsset.js'
import { positions } from './positions.js'

// Zea Engine dependencies stored in new const variables. View the API to see what you can include and use.
const { Scene, GLRenderer, Vec3, Color, Xfo, Ray, resourceLoader, DataImage, EnvMap, TreeItem, GeomItem, Plane, Material, Lines, Quat, Vec4 } = window.zeaEngine
const { CADBody } = zeaCad
class DomTree extends GeomItem {
  /**
   * The onVRPoseChanged method.
   * @param {object} event - The event param.
   */
  onPointerMove(event) {
    super.onPointerMove(event)
    // const ray = event.intersectionData.ray ? event.intersectionData.ray : event.intersectionData.pointerRay
    // this.rayIntersect(ray, 'mousemove', {})
    // event.stopPropagation()
    // if (event.preventDefault) event.preventDefault()
  }

  /**
   * The onVRControllerButtonDown method.
   * @param {object} event - The event param.
   */
  onPointerDown(event) {
    super.onPointerDown(event)
    //const ray = event.intersectionData.ray ? event.intersectionData.ray : event.intersectionData.pointerRay
    // this.rayIntersect(ray, 'mousedown', {})
    // event.stopPropagation()
    // if (event.preventDefault) event.preventDefault()
  }

  /**
   * The onVRControllerButtonUp method.
   * @param {object} event - The event param.
   */
  onPointerUp(event) {
    super.onPointerUp(event)
    //const ray = event.intersectionData.ray ? event.intersectionData.ray : event.intersectionData.pointerRay
    // this.rayIntersect(ray, 'mouseup', {})
    // event.stopPropagation()
    // if (event.preventDefault) event.preventDefault()
  }
}
const plane = new Plane(1, 1)
const billboardData = new Map()
const activeBillboard = new Map()
let readyCallback
export function prepare(readyCb) {
  readyCallback = readyCb

  main()
}

let billboardTree, camera, renderer, headScale, sceneScale, pointerUILine, pointerUIXfo, vr, leftController, xrview, contentHighlitedItem, contentActivePosition
const initState = new Map()

function main() {
  headScale = 1
  // create a new scene
  const scene = new Scene()

  // create a new renderer and attach it to our HTML Canvas
  renderer = new GLRenderer(document.getElementById('canvas'), {
    debugGeomIds: false,
    enableFrustumCulling: true,
  })

  // attach the scene to the renderer. Anything attached to this scene will now be rendererd.
  renderer.setScene(scene)

  // get the camera from renderer
  camera = renderer.getViewport().getCamera()
  // set camera's target and position.
  camera.setPositionAndTarget(new Vec3(11.372241020202637, -7.3188862800598145, 5.77191162109375), new Vec3(0, 0, 1.7))

  // const envMap = new EnvMap()
  // envMap.load('./data/StudioG.zenv')
  // scene.setEnvMap(envMap)

  // // These variables can be used later in our program
  // const grid_size = 10
  // const grid_div = 10

  // scene.setupGrid(grid_size, grid_div)

  // create an empty TreeItem can be added to the scene tree to then add billboards to.
  billboardTree = new TreeItem('billboards')
  scene.getRoot().addChild(billboardTree)

  // Setup FPS Display
  const fpsElement = document.getElementById('fps')
  fpsElement.renderer = renderer

  const highlightColor = new Color('#2a9d8f')
  highlightColor.a = 0.1
  const highlightColorContent = new Color('#2a9d8f')
  highlightColorContent.a = 0.1
  const filterItem = (item) => {
    while (item && !(item instanceof CADBody)) item = item.getOwner()
    return item
  }

  //new content from geom click
  renderer.getViewport().on('pointerUp', (event) => {
    if (window.currentQuizIsSom) return
    if (event.intersectionData && event.button == 0) {
      if (event.intersectionData.geomItem.hasParameter('LayerName')) {
        contentActivePosition = event.intersectionData.intersectionPos
        unhighlightContentItem()
        contentHighlitedItem = event.intersectionData.geomItem //filterItem(event.intersectionData.geomItem)
        contentHighlitedItem.addHighlight('selection', highlightColorContent, true)
        console.log(event.intersectionData.geomItem.getParameter('LayerName').getValue())

        window.newContentRequest(event.intersectionData.geomItem.getParameter('LayerName').getValue(), event)
      }
    }
  })

  scene.getRoot().on('pointerMove', (event) => {
    if (event.intersectionData && event.pointerType == 'xr') {
      const controller = event.controller
      const pointerItem = controller.tipItem.getChild(0)
      const pointerXfo = pointerItem.localXfoParam.value
      pointerXfo.sc.z = event.intersectionData.dist / controller.xrvp.stageScale
      pointerItem.localXfoParam.value = pointerXfo
      console.log('pointerMove - VR', event.intersectionData) //here !
    }

    event.intersectionData.geomItem.addHighlight('selection', highlightColorContent, true)
  })
  scene.getRoot().on('pointerLeave', (event) => {
    if (!event.intersectionData && event.pointerType == 'xr') {
      const controller = event.controller
      const pointerItem = controller.tipItem.getChild(0)
      const pointerXfo = pointerItem.localXfoParam.value
      pointerXfo.sc.z = controller.raycastDist
      pointerItem.localXfoParam.value = pointerXfo
      console.log('pointerLeave - VR', event.intersectionData) //here !
    }

    event.leftGeometry.removeHighlight('selection', highlightColorContent, true)
  })

  renderer.getViewport().on('viewChanged', (event) => {
    //making sure render state are reseted

    // const worldSpacePos = event.viewXfo.tr.add(event.viewXfo.ori.getZaxis().scale(-10.0)) //center of scene

    if (contentHighlitedItem && !vr) {
      const itemPosition = contentActivePosition
      const worldSpacePos = new Vec4(itemPosition.x, itemPosition.y, itemPosition.z, 1)

      const viewport = renderer.getViewport()
      const viewMatrix = viewport.__viewMat
      const projMatrix = viewport.__projectionMatrix
      const viewProjMatrix = projMatrix.multiply(viewMatrix)
      const screenSpacePos = viewProjMatrix.transformVec4(worldSpacePos)

      // perspective divide
      screenSpacePos.x /= screenSpacePos.w
      screenSpacePos.y /= screenSpacePos.w
      const pos2D = [(screenSpacePos.x * 0.5 + 0.5) * viewport.getWidth(), (screenSpacePos.y * -0.5 + 0.5) * viewport.getHeight()]

      positionCallback(pos2D)
    }

    activeBillboard.forEach((billboard, key, map) => {
      billboard.mapper.resetLastElement()
    })
  })

  resourceLoader.on('progressIncremented', (event) => {
    const pct = document.getElementById('progress')
    pct.value = event.percent
    if (event.percent >= 100) {
      setTimeout(() => pct.classList.add('hidden'), 1000)
    }
  })

  //VR
  renderer.getXRViewport().then((xrvp) => {
    if (VRCallback) VRCallback()

    const xrButton = document.getElementById('xr-button')
    xrButton.textContent = 'Launch VR'
    xrButton.classList.remove('hidden')
    xrview = xrvp

    xrvp.on('presentingChanged', (event) => {
      const { state } = event
      if (state) {
        xrButton.textContent = 'Sortir VR'
        vr = true
      } else {
        xrButton.textContent = 'Lancer VR'
        vr = false
      }
    })
    let controllers = []

    xrvp.on('pointerDown', (event) => {
      console.log('pointerup - VR', event.intersectionData) //here !

      if (event.intersectionData) {
        if (event.intersectionData.geomItem.hasParameter('LayerName')) {
          window.newContentRequest(event.intersectionData.geomItem.getParameter('LayerName').getValue(), event)
        }
      }
    })

    xrvp.on('viewChanged', (event) => {
      const headXfo = event.viewXfo
      headScale = headXfo.sc.x

      const sceneXfo = xrvp.getXfo()
      sceneScale = sceneXfo.sc

      if (leftController) {
        callControllerButtonPress(leftController)
      }
    })
    xrvp.on('controllerAdded', (event) => {
      // const xfo = activeBillboard.get('handDomBillboard').get('handDomBillboard').billboard.getParameter('GlobalXfo').getValue();
      controllers = xrvp.getControllers()

      if (controllers.length == 2) {
        //we have both controllers now

        const pointermat = new Material('pointermat', 'LinesShader')
        pointermat.setSelectable(false)
        pointermat.getParameter('BaseColor').setValue(new Color(0, 1, 0))

        const line = new Lines()
        line.setNumVertices(2)
        line.setNumSegments(1)
        line.setSegmentVertexIndices(0, 0, 1)

        const positions = line.getVertexAttribute('positions')
        positions.getValueRef(0).set(0.0, 0.0, 0.0)
        positions.getValueRef(1).set(0.0, 0.0, -1.0)
        line.setBoundingBoxDirty()

        const rightController = getHandController(controllers, 'right')
        rightController.raycastDist = 20.0

        pointerUIXfo = new Xfo()
        pointerUIXfo.sc.set(1, 1, rightController.raycastDist)
        pointerUIXfo.ori.setFromAxisAndAngle(new Vec3(1, 0, 0), -0.8)

        pointerUILine = new GeomItem('VRControllerPointer', line, pointermat)
        pointerUILine.setSelectable(false)

        rightController.getTipItem().removeAllChildren()
        rightController.tipItem.localXfoParam.value = pointerUIXfo
        rightController.getTipItem().addChild(pointerUILine, false)

        rightController.treeItem.setSelectable(false)

        leftController = getHandController(controllers, 'left', [
          () => {
            console.log(0)
          },
          () => {
            console.log(1)
          },
          () => {
            console.log(2)
          },
          () => {
            console.log(3)
          },
          () => {
            console.log(4)
            //x button
            activeBillboard.get('handUI').billboard.setVisible(!activeBillboard.get('handUI').billboard.isVisible())
          },
          () => {
            console.log(5)
            saveCamLocal()
          },
          () => {
            console.log(6)
          },
          () => {
            console.log(7)
          },
        ])

        leftController.getTipItem().removeAllChildren()

        leftController.getTipItem().addChild(activeBillboard.get('handUI').billboard, false)
        const uiLocalXfo = activeBillboard.get('handUI').billboard.getParameter('LocalXfo').getValue()
        uiLocalXfo.ori.setFromAxisAndAngle(new Vec3(1, 0, 0), Math.PI * -0.4)

        uiLocalXfo.tr.set(0.35, -0.05, 0.08)
        activeBillboard.get('handUI').billboard.getParameter('LocalXfo').setValue(uiLocalXfo)
        activeBillboard.get('handUI').billboard.setVisible(false)
      }
    })

    xrButton.addEventListener('click', function (event) {
      xrvp.togglePresenting()
    })

    initState.set(xrview, xrview.getXfo().toJSON())
  })

  //loading the file
  loadAsset('./data/Maison.skp.zcad').then((data) => {
    scene.getRoot().addChild(data.asset)
    const geomItems = []
    data.layersRoot.traverse((geomItem) => {
      geomItems.push({ item: geomItem, visible: geomItem.isVisible() })
    }, true)

    initState.set('tree', geomItems)

    renderer.frameAll()

    camera.setPositionAndTarget(new Vec3(12.597389221191406, -9.85244369506836, 7.654094696044922), new Vec3(12.95663833618164, 2.381739616394043, 6.860876083374023))

    initState.set(camera, camera.globalXfoParam.toJSON())

    if (vr) initState.set(xrview, xrview.getXfo().toJSON())

    readyCallback(data)
  })
}
const scenePositions = positions
export function saveCamLocal() {
  const xfo = vr ? xrview.getXfo() : camera.globalXfoParam.value

  const id = scenePositions.length
  const pos = { id: id, tr: xfo.tr, ori: xfo.ori, sc: xfo.sc }
  console.log(pos, JSON.stringify(pos))
  scenePositions.push(JSON.stringify(pos))
}

export function unhighlightContentItem() {
  if (contentHighlitedItem) {
    contentHighlitedItem = contentHighlitedItem.removeHighlight('selection', true)
  }
}
let positionCallback
export function setPositionCallback(cb) {
  positionCallback = cb
}
export function frameView() {
  camera.frameView(renderer.getViewport(), [contentHighlitedItem])
}
export function goto(posIndex) {
  const pos = typeof scenePositions[posIndex] == 'string' ? JSON.parse(scenePositions[posIndex]) : scenePositions[posIndex]
  if (pos) {
    console.log(pos, vr)

    if (vr) {
      const xfo = xrview.getXfo()
      xfo.ori = new Quat(pos.ori.x, pos.ori.y, pos.ori.z, pos.ori.w)
      xfo.tr = new Vec3(pos.tr.x, pos.tr.y, pos.tr.z)
      xfo.sc = new Vec3(pos.sc.x, pos.sc.x, pos.sc.x)
      xrview.setXfo(xfo)
    } else {
      const xfo = camera.getParameter('GlobalXfo').getValue()
      xfo.ori = new Quat(pos.ori.x, pos.ori.y, pos.ori.z, pos.ori.w)
      xfo.tr = new Vec3(pos.tr.x, pos.tr.y, pos.tr.z)
      xfo.sc = new Vec3(pos.sc.x, pos.sc.x, pos.sc.x)
      camera.getParameter('GlobalXfo').setValue(xfo)
    }
  }
}
export function addDomBillboard(imageData, targetElement, mapper, pos, lookAt, ppm, isInHand, showOnCreation) {
  const domBillboardData = createDomBillboard(imageData, targetElement, pos || new Vec3(1, 1, 5), lookAt || camera.getParameter('GlobalXfo').getValue().tr, ppm)
  const bData = { data: imageData, mapper: mapper, billboard: domBillboardData.billboard, label: domBillboardData.label }
  billboardData.set(targetElement, bData)

  domBillboardData.billboard.on('pointerDown', (event) => {
    const pos = getIntersectionPosition(event.intersectionData, isInHand)
    if (pos) mapper.mapDownToDomElement(pos.x, pos.y)
  })

  domBillboardData.billboard.on('pointerUp', (event) => {
    const pos = getIntersectionPosition(event.intersectionData, isInHand)
    if (pos) mapper.mapClickToDomElement(pos.x, pos.y)
  })

  domBillboardData.billboard.on('pointerMove', (event) => {
    const pos = getIntersectionPosition(event.intersectionData, isInHand)
    if (pos) mapper.mapPosToDomElement(pos.x, pos.y)
  })
  domBillboardData.billboard.on('pointerLeave', (event) => {
    mapper.resetLastElement()
  })

  billboardTree.addChild(domBillboardData.billboard)
  activeBillboard.set(targetElement, bData)

  bData.billboard.getParameter('Visible').setValue(showOnCreation ? showOnCreation : false)
  // bData.billboard.setSelectable(false)
}

export function resetView(resetScene) {
  if (resetScene) {
    const geomItems = initState.get('tree')
    geomItems.forEach((geomItem) => {
      geomItem.item.setVisible(geomItem.visible)
      geomItem.item.shouldBeVisible = geomItem.visible
    })
  }

  if (vr) {
    const xfo = xrview.getXfo()
    const rxfo = initState.get(xrview).value
    xfo.ori = new Quat(rxfo.ori.x, rxfo.ori.y, rxfo.ori.z, rxfo.ori.w)
    xfo.tr = new Vec3(rxfo.tr.x, rxfo.tr.y, rxfo.tr.z)
    if (rxfo.sc) {
      xfo.sc = new Vec3(rxfo.sc.x, rxfo.sc.y, rxfo.sc.z)
    }

    xrview.setXfo(xfo)
    // xrview.getParameter('LocalXfo').setValue(initState.get(xrview))
  } else {
    const camXfo = camera.globalXfoParam.value
    const camInitState = initState.get(camera).value
    camXfo.ori = new Quat(camInitState.ori.x, camInitState.ori.y, camInitState.ori.z, camInitState.ori.w)
    camXfo.tr = new Vec3(camInitState.tr.x, camInitState.tr.y, camInitState.tr.z)

    if (camInitState.sc) {
      camXfo.sc = new Vec3(camInitState.sc.x, camInitState.sc.y, camInitState.sc.z)
    }
    camera.globalXfoParam.value = camXfo
  }

  renderer.requestRedraw()
}

export function updateBillboard(targetElement, bytes, updateScale) {
  if (billboardData.has(targetElement)) {
    const bData = billboardData.get(targetElement)
    bData.billboard.width = bytes.width
    bData.billboard.height = bytes.height
    if (updateScale) {
      const xfo = bData.billboard.getParameter('GlobalXfo').getValue()
      xfo.sc.set(bytes.width * bData.billboard.pixelsPerMeter, bytes.height * bData.billboard.pixelsPerMeter, 1)
      bData.billboard.getParameter('GlobalXfo').setValue(xfo)
    }

    bData.label.setData(bytes.width, bytes.height, bytes)
  }
}

export function showActiveBillboard(targetElement, activeState, orientTowardsCamera) {
  if (activeBillboard.has(targetElement)) {
    const bData = activeBillboard.get(targetElement)
    bData.billboard.getParameter('Visible').setValue(activeState)
    bData.mapper.resetLastElement()
    if (orientTowardsCamera) {
      const xfo = bData.billboard.globalXfoParam.value
      const cxfo = camera.globalXfoParam.value
      xfo.tr = cxfo.tr.add(cxfo.ori.getZaxis().scale(-3))
      const dir = cxfo.tr.subtract(xfo.tr)
      xfo.ori.setFromDirectionAndUpvector(dir, new Vec3(0, 0, 1))
      bData.billboard.globalXfoParam.value = xfo
    }
    renderer.requestRedraw()
  }
}

let leftHandButtons = new Map()

let VRCallback
export function waitForVR(callback) {
  VRCallback = callback
}

export function isVR() {
  return vr
}

function getHandController(controllers, handedness, buttonsCallback) {
  let found = null
  controllers.forEach((controller) => {
    console.log(controller.inputSource)
    if (controller.inputSource.handedness == handedness) {
      found = controller
      if (controller.inputSource.gamepad && buttonsCallback) {
        controller.inputSource.gamepad.buttons.forEach((button, index) => {
          if (buttonsCallback[index]) {
            leftHandButtons.set(button, { callback: buttonsCallback[index], isPressed: false })
          }
        })
      }
    }
  })
  return found
}

function callControllerButtonPress(controller) {
  controller.inputSource.gamepad.buttons.forEach((button, index) => {
    const buttonData = leftHandButtons.get(button)
    if (button.pressed && !buttonData.isPressed && buttonData.callback) {
      buttonData.callback()
      buttonData.isPressed = true
    } else if (!button.pressed) {
      buttonData.isPressed = false
    }
    leftHandButtons.set(button, buttonData)
  })
}

function createDomBillboard(data, label, pos, lookAt, ppm) {
  const billboardLabel = createDataImage(data, label || 'dataimage')
  const billboard = createBillboard(label instanceof HTMLElement ? label.id : label, pos, billboardLabel, lookAt, ppm)
  return { billboard: billboard, label: billboardLabel }
}

function createDataImage(imgData, name) {
  const dataImg = new DataImage(name)
  dataImg.setData(imgData.img.width, imgData.img.height, imgData.bytes)
  return dataImg
}

function createBillboard(label, pos, image, targetPos, targetPPM) {
  const geomItem = new DomTree(label)
  const material = new Material('material', 'FlatSurfaceShader')
  material.getParameter('BaseColor').setImage(image)
  geomItem.getParameter('Geometry').setValue(plane)
  geomItem.getParameter('Material').setValue(material)

  const xfo = new Xfo()
  const ppm = targetPPM || 0.0025
  xfo.sc.set(image.width * ppm, image.height * ppm, 1)
  xfo.tr = pos
  if (targetPos) {
    xfo.ori.setFromDirectionAndUpvector(targetPos.subtract(pos), new Vec3(0, 0, 1))
  } else xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 0, 0), new Vec3(0, 0, 1))

  geomItem.getParameter('GlobalXfo').setValue(xfo)
  geomItem.pixelsPerMeter = ppm
  geomItem.width = image.width
  geomItem.height = image.height
  return geomItem
}

function getIntersectionPosition(intersectionData, isInHand) {
  if (intersectionData) {
    const ray = intersectionData.ray ? intersectionData.ray : intersectionData.pointerRay
    const geomItem = intersectionData.geomItem

    //bug:pointerevent stil firing after maing it invisible
    if (!geomItem.isVisible()) {
      console.log('not good')
      return
    }

    const planeXfo = geomItem.getParameter('GlobalXfo').getValue().clone()
    const plane = new Ray(planeXfo.tr, planeXfo.ori.getZaxis())
    const res = ray.intersectRayPlane(plane)
    if (res <= 0) {
      return -1
    }

    if (vr) {
      const controller = leftController
      const pointerItem = controller.tipItem.getChild(0)
      const pointerXfo = pointerItem.localXfoParam.value
      pointerXfo.sc.z = intersectionData.dist / controller.xrvp.stageScale
      pointerItem.localXfoParam.value = pointerXfo
    }

    //if in hand we must update the scale according to headScale
    planeXfo.sc.set(isInHand ? headScale : 1, isInHand ? headScale : 1, isInHand ? headScale : 1)

    const invPlaneXfo = planeXfo.inverse()
    const hitOffset = invPlaneXfo.transformVec3(ray.pointAtDist(res))
    const clientX = hitOffset.x / geomItem.pixelsPerMeter + geomItem.width * 0.5
    const clientY = -hitOffset.y / geomItem.pixelsPerMeter + geomItem.height * 0.5
    return { x: clientX, y: clientY }
  }
}
// <!-- prettier-ignore-end -->
