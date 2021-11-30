// <!-- prettier-ignore-start -->
// Zea Engine dependencies stored in new const variables. View the API to see what you can include and use.
const { Scene, GLRenderer, Vec3, Color, Xfo, Ray, Label, DataImage, BillboardItem, TreeItem, GeomItem, Plane, Material } = window.zeaEngine

class DomTree extends GeomItem {
  /**
   * The onVRPoseChanged method.
   * @param {object} event - The event param.
   */
  onPointerMove(event) {
    super.onPointerMove(event)
    const ray = event.intersectionData.ray ? event.intersectionData.ray : event.intersectionData.pointerRay
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
    const ray = event.intersectionData.ray ? event.intersectionData.ray : event.intersectionData.pointerRay
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
    const ray = event.intersectionData.ray ? event.intersectionData.ray : event.intersectionData.pointerRay
    // this.rayIntersect(ray, 'mouseup', {})
    // event.stopPropagation()
    // if (event.preventDefault) event.preventDefault()
  }
}
const plane = new Plane(1, 1)
let imgData, domMapper, infoLabel, activeBillboard

export function prepare(imageData, mapper) {
  imgData = imageData
  domMapper = mapper
  main()
}

export function updateBillboard(bytes) {
  infoLabel.setData(imgData.img.width, imgData.img.height, bytes)
}

export function showActiveBillboard(activeState) {
  if (activeBillboard) {
    activeBillboard.getParameter('Visible').setValue(activeState)
    domMapper.resetLastElement()
  }
}

export function createDomBillboard(data, label, pos, lookAt) {
  infoLabel = createDataImage(data, label || 'dataimage')
  activeBillboard = createBillboard('infos', pos, infoLabel, lookAt)
  return activeBillboard
}

export function main() {
  // create a new scene
  const scene = new Scene()

  // create a new renderer and attach it to our HTML Canvas
  const renderer = new GLRenderer(document.getElementById('canvas'), {
    debugGeomIds: false,
    enableFrustumCulling: false,
  })

  // attach the scene to the renderer. Anything attached to this scene will now be rendererd.
  renderer.setScene(scene)

  // get the camera from renderer
  const camera = renderer.getViewport().getCamera()
  // set camera's target and position.
  camera.setPositionAndTarget(new Vec3(6, 10, 12), new Vec3(0, 0, 1.5))

  // These variables can be used later in our program
  const grid_size = 10
  const grid_div = 10

  scene.setupGrid(grid_size, grid_div)

  // create an empty TreeItem can be added to the scene tree to then add billboards to.
  const asset = new TreeItem('labels')
  scene.getRoot().addChild(asset)

  //billboard setup
  const cameraXfo = camera.getParameter('GlobalXfo').getValue()
  const domBillboard = createDomBillboard(imgData, 'dombillboard', new Vec3(1, 1, 5), cameraXfo.tr)

  domBillboard.on('pointerDown', (event) => {
    console.log('pointerDown')
    // domBillboard.visibleParam.value = false
    const pos = getIntersectionPosition(event.intersectionData)
    if (pos) domMapper.mapDownToDomElement(pos.x, pos.y)
  })

  domBillboard.on('pointerUp', (event) => {
    const pos = getIntersectionPosition(event.intersectionData)
    if (pos) domMapper.mapClickToDomElement(pos.x, pos.y)
  })

  domBillboard.on('pointerMove', (event) => {
    const pos = getIntersectionPosition(event.intersectionData)
    if (pos) domMapper.mapPosToDomElement(pos.x, pos.y)
  })

  //when out of billboard, we want last element to reset itself
  renderer.getViewport().on('pointerLeaveGeom', (event) => {
    domMapper.resetLastElement()
  })

  asset.addChild(domBillboard)
  //activeBillboard = infoBillboard;

  //xr (vr) setup
  renderer.getXRViewport().then((xrvp) => {
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

    /*xrvp.on("pointerMove", (event) => {
            const { intersectionData } = event;
            const pos = getIntersectionPosition(intersectionData)
            if (pos)
                domMapper.mapPosToDomElement(pos.x, pos.y);
        });*/

    /*  xrvp.on("pointerDown", (event) => {
              const { intersectionData } = event;
              const pos = getIntersectionPosition(intersectionData)
              if (pos)
                  domMapper.mapDownToDomElement(pos.x, pos.y);
          });*/

    /*  xrvp.on("pointerUp", (event) => {
              const { intersectionData } = event;
              const pos = getIntersectionPosition(intersectionData)
              if (pos)
                  domMapper.mapClickToDomElement(pos.x, pos.y);
          });*/

    xrButton.addEventListener('click', function (event) {
      xrvp.togglePresenting()
    })
  })

  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('profile')) {
    renderer.startContinuousDrawing()
  }
}

function createDataImage(imgData, name) {
  const dataImg = new DataImage(name)
  dataImg.setData(imgData.img.width, imgData.img.height, imgData.bytes)
  return dataImg
}

function createBillboard(label, pos, image, targetPos) {
  const geomItem = new DomTree(label)
  const material = new Material('material', 'FlatSurfaceShader')
  material.getParameter('BaseColor').setImage(image)
  geomItem.getParameter('Geometry').setValue(plane)
  geomItem.getParameter('Material').setValue(material)

  const xfo = new Xfo()
  const ppm = 0.005
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

function getIntersectionPosition(intersectionData) {
  if (intersectionData) {
    const ray = intersectionData.ray ? intersectionData.ray : intersectionData.pointerRay

    const geomItem = intersectionData.geomItem

    if (geomItem.getParameter('Visible').getValue() == false) {
      return
    }
    const planeXfo = geomItem.getParameter('GlobalXfo').getValue().clone()
    const plane = new Ray(planeXfo.tr, planeXfo.ori.getZaxis())

    const res = ray.intersectRayPlane(plane)
    if (res <= 0) {
      return -1
    }

    planeXfo.sc.set(1, 1, 1)
    const invPlaneXfo = planeXfo.inverse()
    const hitOffset = invPlaneXfo.transformVec3(ray.pointAtDist(res))
    const clientX = hitOffset.x / geomItem.pixelsPerMeter + geomItem.width * 0.5
    const clientY = -hitOffset.y / geomItem.pixelsPerMeter + geomItem.height * 0.5
    return { x: clientX, y: clientY }
  }
}
// <!-- prettier-ignore-end -->
