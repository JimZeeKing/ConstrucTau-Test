const CanvasRenderer = {};
CanvasRenderer.setup = function (canvas, originalElement) {
    let api = {};
    api.originalElement = originalElement;
    api.canvas = canvas || document.createElement("canvas");
    api.ctx = api.canvas.getContext("2d");
    api.renders = new Map();
    api.renderElement = function (element, stateName, forceCanvasDimension, clearBefore, forceStateUpdate) {
        if (api.renders.has(element) && api.renders.get(element)[stateName] && !forceStateUpdate) {
            let render = api.renders.get(element)[stateName];
            if (clearBefore) {
                api.ctx.clearRect(render.position.x, render.position.y, render.img.width, render.img.height);
            };

            //rerender from cache
            api.ctx.drawImage(render.img, render.position.x, render.position.y);

            //dispatch
            const renderEvent = new CustomEvent('render', {
                detail: { renderData: render },
                bubbles: true,
                cancelable: true,
                composed: false
            });
            api.originalElement.dispatchEvent(renderEvent);

        } else {
            domtoimage.toPng(element).then((pngData) => {
                var img = new Image();
                img.onload = function () {
                    if (forceCanvasDimension) {
                        api.canvas.width = img.width;
                        api.canvas.height = img.height;
                    };
                    if (clearBefore)
                        api.ctx.clearRect(element.offsetLeft - api.originalElement.offsetLeft, element.offsetTop - api.originalElement.offsetTop, img.width, img.height);

                    api.ctx.drawImage(img, element.offsetLeft - api.originalElement.offsetLeft, element.offsetTop - api.originalElement.offsetTop);
                    let renderStates = api.renders.has(element) ? api.renders.get(element) : {};
                    renderStates[stateName] = {
                        img: img,
                        position: { x: element.offsetLeft - api.originalElement.offsetLeft, y: element.offsetTop - api.originalElement.offsetTop },
                        bytes: (api.renders.has(api.originalElement) ? api.ctx.getImageData(0, 0, api.canvas.width, api.canvas.height) : null)
                    }

                    console.log(api.getRenderDataForElement(api.originalElement));
                    api.renders.set(element, renderStates);
                    const renderEvent = new CustomEvent('render', {
                        detail: { renderData: renderStates[stateName] },
                        bubbles: true,
                        cancelable: true,
                        composed: false
                    });
                    api.originalElement.dispatchEvent(renderEvent);
                };
                img.src = pngData;
            });
        }



    };

    api.getRenderDataForElement = function (element) {
        return api.renders.get(element);
    }



    //originalElement render
    if (originalElement) {
        api.renderElement(originalElement, originalElement.className, true);

    };


    api.renderOriginal = function () {
        api.updateAllPositions();
        api.renderElement(api.originalElement, originalElement.className, true, false, true);
    }

    api.updateAllPositions = function () {
        api.renders.forEach((render, element) => {
            for (const state in render) {
                render[state].position = { x: element.offsetLeft - api.originalElement.offsetLeft, y: element.offsetTop - api.originalElement.offsetTop }
            }
        })
    }

    return api;
};

