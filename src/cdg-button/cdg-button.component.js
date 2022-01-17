class CdgButtonComponent extends HTMLElement {
  static get observedAttributes() {
    return ["name"];
  }

  //ngOnInit
  connectedCallback() {
    const template = document.createElement("template");

    template.innerHTML = `
    <div>
        <button data-okButton>ok</button>
        <button data-cancelButton>cancel</button>
    </div>
`;

    const templateEl = template.content.cloneNode(true);
    this.appendChild(templateEl);

    const okButtonEl = this.querySelector("[data-okButton]");
    okButtonEl.addEventListener("click", (event) => {
      this.dispatchEvent(new Event("clickOk"));
    });

    const cancelButtonEl = this.querySelector("[data-cancelButton]");
    cancelButtonEl.addEventListener("click", (event) => {
      this.dispatchEvent(new Event("clickCancel"));
    });
  }

  //ngOnChange
  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log("oldVal", oldVal);
    console.log("newVal", newVal);
  }

  //ngOnDestroy
  disconnectedCallback() {
    console.log("destroy!");
  }
}

customElements.define("app-cdg-button", CdgButtonComponent);

const x = 10;

export { x };
