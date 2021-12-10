const { GeomItem, TreeItem, SelectionSet, InstanceItem, MeshProxy } = zeaEngine
const { CADAsset, CADBody } = zeaCad

const loadAsset = (url) => {
  return new Promise((resolve) => {
    const asset = new CADAsset()
    const layers = {}
    const layersRoot = new TreeItem('Couches')

    asset.load(url).then(() => {
      if (asset.hasParameter('LayerPaths')) {
        const layerPaths = asset.getParameter('LayerPaths').getValue()
        layerPaths.forEach((path) => {
          const parts = path.split('>')
          let item = layersRoot
          parts.forEach((name, index) => {
            if (index == parts.length - 1) {
              if (layers[name]) {
                console.warn('Duplicate layer names found')
              }
              const layerItem = new SelectionSet(name)
              item.addChild(layerItem)
              layers[name] = layerItem
            } else {
              let folderItem = item.getChildByName(name)
              if (!folderItem) {
                folderItem = new TreeItem(name)
                item.addChild(folderItem)
              }
              item = folderItem
            }
          })
        })
      }

      let numItems = 0
      let numGeomItem = 0
      asset.traverse((item) => {
        numItems++
        // if (item instanceof InstanceItem) {
        //   return false;
        // }
        if (item instanceof GeomItem) {
          if (item.hasParameter('LayerName')) {
            const layerName = item.getParameter('LayerName').getValue()
            if (layers[layerName]) layers[layerName].addItem(item)
          }
          const geom = item.getParameter('Geometry').getValue()
          if (geom instanceof MeshProxy) {
          }
          numGeomItem++
        }
      })
      console.log('numItems:', numItems, 'numGeomItem:', numGeomItem)
      const materials = asset.getMaterialLibrary().getMaterials()
      materials.forEach((material) => {
        material.setShaderName('ConstrucTAOSurfaceShader')
        const baseColorParam = material.getParameter('BaseColor')
        if (baseColorParam) {
          baseColorParam.setValue(baseColorParam.getValue().toGamma())
          // const image = baseColorParam.getImage()
          // if (image) {
          //   console.log(image)
          // }
        }
        // console.log(material.getName(), material.getShaderName());

        switch (material.getName()) {
          case 'Tyvek':
          case '[Sheet Metal]':
            material.getParameter('Overlay').setValue(0.05)
            break
        }
      })
      resolve({
        asset,
        layers,
        layersRoot,
      })
    })
  })
}

export default loadAsset
