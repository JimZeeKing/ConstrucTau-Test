const { Ray, Xfo, Vec3, Color } = window.zeaEngine;

/**
 * This sample UI class shows how to build a custom UI for VR interfaces.
 *
 * @extends {HTMLElement}
 */
class DomUI extends HTMLElement {
  /**
   * Creates an instance of DomUI.
   */
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });

    this.contentDiv = document.createElement("div");
    this.contentDiv.id = "contentDiv";
    shadowRoot.appendChild(this.contentDiv);

    this.buttonsContainer = document.createElement("div");
    this.buttonsContainer.id = "buttonsContainer";
    this.contentDiv.appendChild(this.buttonsContainer);

    this.toolsContainer = document.createElement("div");
    this.toolsContainer.id = "toolsContainer";
    this.contentDiv.appendChild(this.toolsContainer);

    const addButton = (icon, cb) => {
      const button = document.createElement("button");
      button.classList.add("button");
      button.classList.add("widget");
      this.buttonsContainer.appendChild(button);
      button.addEventListener("mouseenter", () => {
        button.classList.add("button-hover");
      });
      button.addEventListener("mouseleave", () => {
        button.classList.remove("button-hover");
      });
      button.addEventListener("mousedown", () => {
        button.classList.add("button-active");
        cb(img);
      });
      button.addEventListener("mouseup", () => {
        button.classList.remove("button-active");
      });
      const img = new Image();
      img.classList.add("button-image");
      img.src = icon;
      button.appendChild(img);
    };
    addButton("data/images/dustin-w-Undo-icon.png", () => {
      const { UndoRedoManager } = window.zeaUx;
      UndoRedoManager.getInstance().undo();
    });
    addButton("data/images/dustin-w-Redo-icon.png", () => {
      const { UndoRedoManager } = window.zeaUx;
      UndoRedoManager.getInstance().redo();
    });
    addButton("data/images/color-green.png", () => {});
    addButton("data/images/color-red.png", () => {});

    const styleTag = document.createElement("style");
    styleTag.appendChild(
      document.createTextNode(`

#contentDiv {
  // position: absolute;
  // top: 0px;
  // left: 0px;
  width: 280px;
  user-select: none;
}

.button {
  border: 2px solid #333333;
  width: 90px;
  height: 90px; 
  border-radius: 15px;
  background-color: #b0b0b0;
  margin: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-image {
  width: 80px;
  height: 80px; 
}

#buttonsContainer {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  flex-direction: row;
}

.button-hover {
  background: #d0d0d0;
  border: 2px dashed #FF0000;
}

.button-active {
  border: 2px solid #FF0000;
  background: #FFFFFF;
}

.label {
  color: black;
}

.slidecontainer {
  width: 100%; /* Width of the outside container */
  height: 25px; /* Specified height */
  background: #d3d3d3; /* Grey background */
}


        `)
    );
    shadowRoot.appendChild(styleTag);
  }
}
window.customElements.define("dom-ui", DomUI);
