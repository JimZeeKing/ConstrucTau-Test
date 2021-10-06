// Zea Engine dependencies stored in new const variables. View the API to see what you can include and use.
const { Scene, GLRenderer, Vec3, Color, Xfo, Label, DataImage, BillboardItem, TreeItem } = window.zeaEngine

function createLabel(color, labelText) {
    const label = new Label(labelText);

    label.getParameter('FontSize').setValue(48);
    label.getParameter('FontColor').setValue(color);
    label.getParameter('BackgroundColor').setValue(new Color(0.3, 0.3, 0.3));
    return label
}

function loadImage(src, callback) {
    let img = new Image();

    img.onload = function () {
        callback(img);
    }

    img.src = src;
}


function createCanvas(width, height) {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;

}
function createDataImage(data, name) {
    const di = new DataImage(name);
    di.setData(100, 100, data);
    return di;
}

function createBillboard(label, pos) {
    const billboard = new BillboardItem('billboard', label);
    const xfo = new Xfo(pos);
    billboard.getParameter('LocalXfo').setValue(xfo);
    billboard.getParameter('PixelsPerMeter').setValue(300);
    billboard.getParameter('AlignedToCamera').setValue(true);
    billboard.getParameter('Alpha').setValue(1);
    return billboard;
}
let data;
export function prepare() {
    loadImage("../data/images/dog.jpg", (image) => {
        const canvas = createCanvas(image.width, image.height);
        canvas.getContext("2d").drawImage(image, 0, 0);
        data = canvas.getContext("2d").getImageData(0, 0, image.width, image.height);
        main();
    });
}

export function main() {






    // create a new scene
    const scene = new Scene()

    // create a new renderer and attach it to our HTML Canvas
    const renderer = new GLRenderer(document.getElementById('canvas'))

    // attach the scene to the renderer. Anything attached to this scene will now be rendererd.
    renderer.setScene(scene)

    // get the camera from renderer
    const camera = renderer.getViewport().getCamera()
    // set camera's target and position.
    camera.setPositionAndTarget(new Vec3(6, 6, 5), new Vec3(0, 0, 1.5))

    // These variables can be used later in our program
    const grid_size = 10
    const grid_div = 10
    const grid_div_size = grid_size / grid_div

    scene.setupGrid(grid_size, grid_div)

    // create an empty TreeItem can be added to the scene tree to then add billboards to.
    const asset = new TreeItem('labels')
    scene.getRoot().addChild(asset)

    const label0 = createDataImage(data, 'Hello')
    const billboard0 = createBillboard(label0, new Vec3(1, 1, 1))
    asset.addChild(billboard0)

    const label1 = createLabel(new Color(1, 1, 0), 'Long')
    const billboard1 = createBillboard(label1, new Vec3(-1, -1, 1))
    asset.addChild(billboard1)

    const label2 = createLabel(new Color(1, 1, 0), 'MyCustomLabel')
    const billboard2 = createBillboard(label2, new Vec3(0, 0.05, 0.08))
    asset.addChild(billboard2)

    renderer.resumeDrawing()
}

