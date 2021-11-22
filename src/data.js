// <!-- prettier-ignore-start -->
// Zea Engine dependencies stored in new const variables. View the API to see what you can include and use.
const { Scene, GLRenderer, Vec3, Color, Xfo, Ray, Label, DataImage, BillboardItem, TreeItem, GeomItem, Plane, Material, VRViewManipulator } = window.zeaEngine

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
const plane = new Plane(1, 1);
const billboardData = new Map();
const activeBillboard = new Map();

export function prepare() {
    main()
}

export function addDomBillboard(imageData, targetElement, mapper, pos, lookAt, ppm) {
    const domBillboardData = createDomBillboard(imageData, targetElement, pos || new Vec3(1, 1, 5), lookAt || camera.getParameter('GlobalXfo').getValue().tr, ppm);
    const bData = { data: imageData, mapper: mapper, billboard: domBillboardData.billboard, label: domBillboardData.label };
    billboardData.set(targetElement, bData);

    domBillboardData.billboard.on('pointerDown', (event) => {
        const pos = getIntersectionPosition(event.intersectionData)
        if (pos)
            mapper.mapDownToDomElement(pos.x, pos.y);
    })

    domBillboardData.billboard.on('pointerUp', (event) => {
        const pos = getIntersectionPosition(event.intersectionData)
        if (pos)
            mapper.mapClickToDomElement(pos.x, pos.y);
    })

    domBillboardData.billboard.on('pointerMove', (event) => {
        const pos = getIntersectionPosition(event.intersectionData)
        if (pos)
            mapper.mapPosToDomElement(pos.x, pos.y);
    })
    domBillboardData.billboard.on('pointerLeave', (event) => {
        mapper.resetLastElement();
    })

    billboardTree.addChild(domBillboardData.billboard);
    activeBillboard.set(targetElement, bData);
}

export function updateBillboard(targetElement, bytes) {
    if (billboardData.has(targetElement)) {
        const bData = billboardData.get(targetElement)
        bData.label.setData(bData.data.img.width, bData.data.img.height, bytes);
    };

}

export function showActiveBillboard(targetElement, activeState) {
    if (activeBillboard.has(targetElement)) {
        const bData = activeBillboard.get(targetElement);
        bData.billboard.getParameter("Visible").setValue(activeState);
        bData.mapper.resetLastElement();
        renderer.requestRedraw();
    };
}


let billboardTree, camera, renderer;
export function main() {
    // create a new scene
    const scene = new Scene()

    // create a new renderer and attach it to our HTML Canvas
    renderer = new GLRenderer(document.getElementById('canvas'), {
        debugGeomIds: false,
        enableFrustumCulling: false,
    })

    // attach the scene to the renderer. Anything attached to this scene will now be rendererd.
    renderer.setScene(scene)

    // get the camera from renderer
    camera = renderer.getViewport().getCamera()
    // set camera's target and position.
    camera.setPositionAndTarget(new Vec3(6, 10, 12), new Vec3(0, 0, 1.5))

    // These variables can be used later in our program
    const grid_size = 10
    const grid_div = 10

    scene.setupGrid(grid_size, grid_div)

    // create an empty TreeItem can be added to the scene tree to then add billboards to.
    billboardTree = new TreeItem('billboards');
    scene.getRoot().addChild(billboardTree)


    //billboard setup
    const cameraXfo = camera.getParameter('GlobalXfo').getValue()
    // const domBillboard = createDomBillboard(imgData, 'dombillboard', new Vec3(1, 1, 5), cameraXfo.tr);

    //xr (vr) setup
    renderer.getXRViewport().then((xrvp) => {
        const xrButton = document.getElementById("xr-button");
        xrButton.textContent = "Launch VR";
        xrButton.classList.remove("hidden");

        const vm = xrvp.getManipulator();
        //always fired?
        /* vm.onVRPoseChanged = (event) => {
            // super.onVRPoseChanged(event);
             //  console.log(event.controllers[0].getTreeItem().getParameter('LocalXfo').getValue().ori.toEulerAngles(0).z);
         }*/

        xrvp.on("presentingChanged", (event) => {
            const { state } = event;
            if (state) {
                xrButton.textContent = "Exit VR";
            } else {
                xrButton.textContent = "Launch VR";
            }


        });
        let controllers = [];

        /*  xrvp.on('viewChanged', (event) => {
              const headXfo = event.viewXfo;
              if (controllers.length == 2) {
                  const xfoA = controllers[1].getTreeItem().getParameter('GlobalXfo').getValue()
                  const headToCtrlA = xfoA.tr.subtract(headXfo.tr)
                  headToCtrlA.normalizeInPlace();
                  console.log(headToCtrlA.angleTo(xfoA.ori.getYaxis()), Math.PI * 0.25);
                  if (headToCtrlA.angleTo(xfoA.ori.getYaxis()) < Math.PI * 0.25) {
                      showHandUI(headXfo, controllers[1], controllers[0], true);
                      // showActiveBillboard('templateContainer', true);
                  } //else showHandUI(headXfo, false);
              };
  
          });*/
        xrvp.on('controllerAdded', (event) => {
            // const xfo = activeBillboard.get('handDomBillboard').get('handDomBillboard').billboard.getParameter('GlobalXfo').getValue();
            controllers = xrvp.getControllers();

            /* const pointermat = new Material('pointermat', 'LinesShader')
             pointermat.setSelectable(false)
             pointermat.getParameter('BaseColor').setValue(new Color(1.2, 0, 0))*/

            if (controllers.length == 2) {
                //we have both controllers now

                console.log(controllers);

                const leftController = getHandController(controllers, "left");
                // const uiLocalXfo = controllers[1].getTreeItem().getParameter('LocalXfo').getValue()
                leftController.getTipItem().addChild(activeBillboard.get('templateContainer').billboard, false)
                const uiLocalXfo = activeBillboard.get('templateContainer').billboard.getParameter('LocalXfo').getValue()
                // uiLocalXfo.ori.set(0, 0, 0);
                uiLocalXfo.ori.setFromAxisAndAngle(new Vec3(1, 0, 0), Math.PI * -0.2);

                uiLocalXfo.tr.set(0.35, -0.05, 0.08)
                activeBillboard.get('templateContainer').billboard.getParameter('LocalXfo').setValue(uiLocalXfo)

            };

            //  controllers[0].getTreeItem().addChild(activeBillboard.get('handDomBillboard').billboard);
            /* xrvp.on('onVRPoseChanged', (event) => {
                 console.log('poschange');
             })*/
        });





        xrButton.addEventListener("click", function (event) {
            xrvp.togglePresenting();
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("profile")) {
        renderer.startContinuousDrawing();
    }

}
let handUIActive = false;

function getHandController(controllers, handedness) {
    let found = null;
    controllers.forEach((controller) => {
        if (controller.__inputSource.handedness == handedness) found= controller;
    })

    return found;
}
function showHandUI(headXfo, handController, pointerController, state) {

    if (handUIActive != state) {
        handUIActive = state;
        //ui hand
        const uiLocalXfo = handController.getTreeItem().getParameter('LocalXfo').getValue()
        uiLocalXfo.ori.setFromAxisAndAngle(new Vec3(1, 0, 0), Math.PI * -0.6);

        //pointer hand
        const xfoA = handController.getTreeItem().getParameter('GlobalXfo').getValue()
        const xfoB = pointerController.getTreeItem().getParameter('GlobalXfo').getValue()
        const headToCtrlA = xfoA.tr.subtract(headXfo.tr)
        const headToCtrlB = xfoB.tr.subtract(headXfo.tr)
        if (headToCtrlA.cross(headToCtrlB).dot(headXfo.ori.getYaxis()) > 0.0) {
            uiLocalXfo.tr.set(0.05, -0.05, 0.08)
        } else {
            uiLocalXfo.tr.set(-0.05, -0.05, 0.08)
        }

        handController.getTreeItem().getParameter('LocalXfo').setValue(uiLocalXfo)

        console.log(activeBillboard.get('templateContainer'));
        handController.getTipItem().addChild(activeBillboard.get('templateContainer').billboard, false)
    };




}

function createDomBillboard(data, label, pos, lookAt, ppm) {
    const billboardLabel = createDataImage(data, label || 'dataimage');
    const billboard = createBillboard("infos", pos, billboardLabel, lookAt, ppm);
    return { billboard: billboard, label: billboardLabel };
}

function createDataImage(imgData, name) {
    const dataImg = new DataImage(name)
    dataImg.setData(imgData.img.width, imgData.img.height, imgData.bytes)
    return dataImg;
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
    xfo.tr = pos;
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

        //bug:pointerevent stil firing after maing it invisible
        if (geomItem.getParameter("Visible").getValue() == false) {
            return;
        };

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
        return { x: clientX, y: clientY };

    }
}
// <!-- prettier-ignore-end -->
