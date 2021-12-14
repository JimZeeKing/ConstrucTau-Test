const { BillboardItem, Label, Color, Xfo } = window.zeaEngine

const billboards = {}
let activeBillboard

const setActiveBillboard = (billboard) => {
  if (activeBillboard != billboard) {
    if (activeBillboard) activeBillboard.getParameter('Visible').setValue(false)
    activeBillboard = billboard
    activeBillboard.getParameter('Visible').setValue(true)
  }
}

const displayBillboardOnClick = (intersectionData, labelsData, billboards) => {
  const layerName = intersectionData.geomItem.getParameter('LayerName').getValue()

  console.log(layerName)

  const pos = intersectionData.pointerRay.pointAtDist(intersectionData.dist)
  const xfo = new Xfo(pos)

  if (!billboards[layerName]) {
    const label = new Label(layerName)
    label.fontSizeParam.value = 48
    label.fontColorParam.value = new Color(0.15, 0.15, 0.15)
    label.backgroundColorParam.value = new Color(0.85, 0.85, 0.85)
    label.outlineColorParam.value = new Color('#05466E')

    const text = labelsData[layerName] ? labelsData[layerName].Content.replaceAll('', '\n').replaceAll('\\n', '\n') : layerName
    label.getParameter('Text').setValue(text)

    const billboard = new BillboardItem(layerName, label)
    billboard.localXfoParam.value = xfo
    billboard.pixelsPerMeterParam.value = 300
    billboard.alignedToCameraParam.value = true
    billboard.drawOnTopParam.value = true
    billboard.fixedSizeOnscreenParam = false
    billboard.alphaParam.value = 1
    billboards.addChild(billboard)

    // billboard.on("pointerEnter", (event) => {
    //   billboard.addHighlight("pointerOver", new Color(1, 0, 0, 0.2), true);
    //   console.log("pointerEnter", event);
    // });
    // billboard.on("pointerLeave", (event) => {
    //   billboard.removeHighlight("pointerOver", true);
    //   console.log("pointerLeave", event);
    // });
    billboard.on('pointerDown', (event) => {
      console.log('pointerDown', event)
    })
    billboard.on('pointerUp', (event) => {
      console.log('pointerUp', event)
    })

    billboards[layerName] = billboard
    setActiveBillboard(billboard)
  } else {
    const billboard = billboards[layerName]
    billboard.getParameter('LocalXfo').setValue(xfo)
    setActiveBillboard(billboard)
  }
}
export default displayBillboardOnClick
