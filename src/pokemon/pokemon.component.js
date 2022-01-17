import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
class PokemonComponent extends HTMLElement {
  static get observedAttributes() {
    return ["pokename"];
  }

  destroy$ = new Subject();

  pokeObject$ = new ReplaySubject(1);

  set pokemonName(name) {
    this.shadowRoot.querySelector("[data-name]").textContent = name;
  }

  set pokeImage(imageUrl) {
    this.shadowRoot.querySelector("[data-image] img").src = imageUrl;
  }

  set pokeObject(jsonBody) {
    this.pokeObject$.next(jsonBody);
  }

  constructor() {
    super();
  }

  // ngOnInit
  connectedCallback() {
    this.attachShadow({ mode: "open" });

    const template = document.createElement("template");
    template.innerHTML = `
      <style>
         [data-pokemon] {
            display: flex; 
            place-items: center;
             flex-direction: column;
         }
      </style>
      <div data-pokemon>
        <div data-image>
          <img />
        </div>
        <div data-name></div>
      </div>
      `;
    const templateNode = template.content.cloneNode(true);
    this.shadowRoot.appendChild(templateNode);

    this.pokeObject$.pipe(takeUntil(this.destroy$)).subscribe((jsonBody) => {
      this.pokemonName = jsonBody.name;
      this.pokeImage = jsonBody.sprites.front_default;
    });
  }

  //ngOnDestroy
  disconnectedCallback() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //ngOnChanges
  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === "pokename") {
      this.loadPokemon(newVal);
    }
  }

  async loadPokemon(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const jsonBody = await response.json();

    this.pokemonName = jsonBody.name;
    this.pokeImage = jsonBody.sprites.front_default;
  }
}

customElements.define("app-pokemon", PokemonComponent);

export default PokemonComponent;
