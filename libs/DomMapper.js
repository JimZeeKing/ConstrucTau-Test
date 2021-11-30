const DomMapper = {};
DomMapper.setup = function (domTargetElement) {
    let api = {};
    api.domTargetElement = domTargetElement;
    api.elements = api.domTargetElement.querySelectorAll("[data-mapping]");
    api.elementsPositions = [];
    api.element = null;
    api.lastElement = null;

    api.getDomElementAtPosition = function (x, y) {
        for (var i = 0; i < api.elementsPositions.length; i++) {
            let elementPosition = api.elementsPositions[i];
            if (x >= elementPosition.x
                && x <= elementPosition.x + elementPosition.width
                && y >= elementPosition.y
                && y <= elementPosition.y + elementPosition.height) {
                return elementPosition.element;
            };
        };
        return null;
    };

    api.updateMapping = function () {
        api.elements = api.domTargetElement.querySelectorAll("[data-mapping]");
        api.updatePositions();
        api.updatePositions();
    }

    api.updatePositions = function () {
        api.elementsPositions = [];
        api.elements.forEach((element) => {
            let elementPosition = {
                x: element.offsetLeft - api.domTargetElement.offsetLeft,
                y: element.offsetTop - api.domTargetElement.offsetTop,
                width: element.scrollWidth,
                height: element.scrollHeight,
                element: element
            };
            api.elementsPositions.push(elementPosition);
        })
    };

    api.mapClickToDomElement = function (x, y) {
        if (api.element) {
            api.element.dispatchEvent(new MouseEvent("click"));
            if (api.element.hasAttribute("data-down-class") && api.element.classList.contains(api.element.dataset.downClass))
                api.element.classList.remove(api.element.dataset.downClass);
            if (api.element.hasAttribute("data-active-class")) {

                if (api.element.hasAttribute("data-active-group")) {
                    const activeElement = document.querySelector('.' + api.element.dataset.activeClass);
                    if (activeElement && activeElement !== api.element) {
                        activeElement.active = false;
                        activeElement.classList.remove(activeElement.dataset.activeClass);
                        dispatchDomEvent(api.domTargetElement, { x: x, y: y, element: activeElement, type: "out" });
                    };
                };

                if (!api.element.classList.contains(api.element.dataset.activeClass)) {
                    api.element.classList.add(api.element.dataset.activeClass);
                    api.element.active = true;
                }
            };

            if (api.element.hasAttribute("data-target-id")) {
                const ids = api.element.dataset.targetId.split(",");
                let nextId = ids[0];
                for (var i = 0; i < ids.length; i++) {
                    if (document.querySelector(`#${ids[i]}`).classList.contains(document.querySelector(`#${ids[i]}`).dataset.removeClass)) {
                        nextId = ids[i];
                        break;
                    };
                }

                const targetElement = document.querySelector(`#${nextId}`);
                if (targetElement && targetElement.hasAttribute("data-remove-class")) {
                    if (targetElement.classList.contains(targetElement.dataset.removeClass)) {
                        targetElement.classList.remove(targetElement.dataset.removeClass);
                        dispatchDomEvent(api.domTargetElement, { x: x, y: y, element: targetElement, type: "display" });
                    };
                }
            };


            if (api.element.hasAttribute("data-target-id-sibling")) {
                const id = api.element.dataset.targetIdSibling;

                const siblingContainer = document.querySelector(`#${id}`);
                const siblings = siblingContainer.querySelectorAll("img");

                let nextSibling = siblings[0];

                for (var i = 0; i < siblings.length; i++) {
                    if (siblings[i].classList.contains(siblings[i].dataset.removeClass)) {
                        nextSibling = siblings[i];
                        break;
                    };
                }

                const targetElement = nextSibling;
                if (targetElement && targetElement.hasAttribute("data-remove-class")) {
                    if (targetElement.classList.contains(targetElement.dataset.removeClass)) {
                        targetElement.classList.remove(targetElement.dataset.removeClass);
                        dispatchDomEvent(api.domTargetElement, { x: x, y: y, element: targetElement, type: "display" });
                    };

                }
            };

            dispatchDomEvent(api.domTargetElement, { x: x, y: y, element: api.element, type: "click" });
        };
    }

    api.mapPosToDomElement = function (x, y) {

        api.element = api.getDomElementAtPosition(x, y);




        if (api.element) {
            if (api.element.hasAttribute("data-hover-class") && !api.element.classList.contains(api.element.dataset.hoverClass)) {
                api.element.classList.add(api.element.dataset.hoverClass);
                dispatchDomEvent(api.domTargetElement, { x: x, y: y, element: api.element, type: !api.element.active ? "over" : "over-active" });
            }

            if (api.lastElement && api.lastElement != api.element) {
                api.resetLastElement();
            };


            api.lastElement = api.element;

            document.body.style.cursor = 'pointer';

        } else {

            if (api.lastElement && api.lastElement != api.element) {
                api.resetLastElement();
            };
        }
    }

    api.mapDownToDomElement = function (x, y) {
        if (api.element) {
            api.element.dispatchEvent(new MouseEvent("mousedown"));
            if (api.element.hasAttribute("data-down-class")) {
                api.element.classList.add(api.element.dataset.downClass);
                dispatchDomEvent(api.domTargetElement, { x: x, y: y, element: api.element, type: "down" });
            }
        };
    }

    api.resetLastElement = function () {
        if (api.lastElement) {
            const cl = api.lastElement.classList;
            if (api.lastElement.hasAttribute("data-hover-class") && cl.contains(api.lastElement.dataset.hoverClass)) cl.remove(api.lastElement.dataset.hoverClass);
            if (api.lastElement.hasAttribute("data-down-class") && cl.contains(api.lastElement.dataset.downClass)) cl.remove(api.lastElement.dataset.downClass);
            if (api.lastElement.classList != cl) {
                api.lastElement.classList = cl;
            };

            dispatchDomEvent(api.domTargetElement, { element: api.lastElement, type: !api.lastElement.active ? "out" : "out-active" });
            api.lastElement = null;


        };
        document.body.style.cursor = 'default';
    }

    function dispatchDomEvent(dispatcher, domData) {
        let domEvent = new CustomEvent("domevent", { bubbles: true, detail: domData });
        dispatcher.dispatchEvent(domEvent);
    };

    //first update of positions at start
    api.updatePositions();
    return api;
}