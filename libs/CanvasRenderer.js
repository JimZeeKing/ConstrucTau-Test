const CanvasRenderer = {};
CanvasRenderer.setup = function () {
    let api = {};
    api.renderContainers = new Map();

    api.addRenderContainer = function (container, bgColor, cb) {
        const canvas = document.createElement("canvas");
        api.renderContainers.set(container, { renders: new Map(), bgColor: bgColor, canvas: canvas, ctx: canvas.getContext("2d") });
        api.renderMainContainer(container, cb);
    };

    api.renderElement = function (container, element, stateName, forceCanvasDimension, clearBefore, forceStateUpdate, cb) {

        const renderContainer = api.renderContainers.get(container);

        if (renderContainer && renderContainer.renders.has(element) && renderContainer.renders.get(element)[stateName] && !forceStateUpdate) {

            let renderStates = renderContainer.renders.get(element);

            if (renderStates.currentState == stateName)
                return;

            renderStates.currentState = stateName;
            const render = renderStates[stateName];

            if (clearBefore)
                api.clear(container, render.position.x, render.position.y, render.img.width, render.img.height);

            //rerender from cache
            renderContainer.ctx.globalCompositeOperation = 'source-over';
            renderContainer.ctx.drawImage(render.img, render.position.x, render.position.y, render.img.width, render.img.height);

            setTimeout(() => {
                render.bytes = renderContainer.ctx.getImageData(0, 0, renderContainer.canvas.width, renderContainer.canvas.height)
                renderStates[stateName] = render;
                renderContainer.renders.set(element, renderStates);
                api.renderContainers.set(container, renderContainer)
                dispatchRenderEvent(container, render);
                if (cb) {
                    cb(renderStates[stateName]);
                };
            }, 50);

        } else {
            domtoimage.toPng(element).then((pngData) => {
                var img = new Image();
                img.onload = function () {
                    if (forceCanvasDimension) {
                        renderContainer.canvas.width = img.width;
                        renderContainer.canvas.height = img.height;
                    };

                    if (clearBefore)
                        api.clear(container, element.offsetLeft - container.offsetLeft, element.offsetTop - container.offsetTop, img.width, img.height);

                    renderContainer.ctx.globalCompositeOperation = 'source-over';
                    renderContainer.ctx.drawImage(img, element.offsetLeft - container.offsetLeft, element.offsetTop - container.offsetTop);

                    let renderStates = renderContainer.renders.has(element) ? renderContainer.renders.get(element) : {};

                    let position = {
                        x: element.offsetLeft - container.offsetLeft,
                        y: element.offsetTop - container.offsetTop,
                    };
                    renderStates[stateName] = {
                        img: img,
                        position: position,
                        bytes: renderContainer.ctx.getImageData(0, 0, renderContainer.canvas.width, renderContainer.canvas.height)

                    }
                    renderStates.currentState = stateName;
                    renderContainer.renders.set(element, renderStates);
                    api.renderContainers.set(container, renderContainer)
                    dispatchRenderEvent(container, renderStates[stateName]);
                    if (cb) {
                        cb(renderStates[stateName]);
                    };
                };
                img.src = pngData;
            });
        }
    };


    api.clear = function (container, x, y, w, h) {
        const renderContainer = api.renderContainers.get(container)
        renderContainer.ctx.clearRect(x, y, w, h);
        renderContainer.ctx.fillStyle = renderContainer.bgColor;
        //draw behind what is already there
        renderContainer.ctx.globalCompositeOperation = 'destination-over'
        renderContainer.ctx.fillRect(x, y, w, h);
    }


    api.renderMainContainer = function (container, cb) {
        api.updateAllPositions(container);
        api.renderElement(container, container, container.className, true, false, true, cb);
    }

    api.updateAllPositions = function (container) {
        const renderContainer = api.renderContainers.get(container);

        renderContainer.renders.forEach((render, element) => {
            for (const state in render) {
                render[state].position = { x: element.offsetLeft - container.offsetLeft, y: element.offsetTop - container.offsetTop }
            }
        })
        api.renderContainers.set(container, renderContainer);
    }

    function dispatchRenderEvent(dispatcher, renderData) {
        let renderEvent = new CustomEvent("render", { bubbles: true, detail: { renderData: renderData } });
        dispatcher.dispatchEvent(renderEvent);
    };

    return api;
};

