import { fromEvent, from } from "rxjs";
import { debounceTime, tap, switchMap, concatMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
class PokemonShowComponent extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  get showDisplayEl() {
    return this.shadowRoot.querySelector("[data-pokemon-show-display]");
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
   <style></style>
   <app-pokemon-paginator limit="20" offset="0"> </app-pokemon-paginator>
   <div data-pokemon-show-display style="display: flex; flex-wrap: wrap">
   </div>
    `;
  }
  connectedCallback() {
    const pokemonPaginatorComponent = this.shadowRoot.querySelector(
      "app-pokemon-paginator"
    );
    fromEvent(pokemonPaginatorComponent, "loadedPokemon")
      .pipe(
        debounceTime(300),
        tap((event) => {
          this.showDisplayEl.innerHTML = "";
        }),
        switchMap((event) => {
          const results = event.detail;
          return from(results).pipe(
            concatMap((pokemon) => {
              return ajax.getJSON(
                `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`
              );
            })
          );
        })
      )
      .subscribe(async (pokemon) => {
        await customElements.whenDefined("app-pokemon");

        const pokemonComponent = document.createElement("app-pokemon");
        //   pokemonComponent.setAttribute("pokename", pokemon.name);
        // pokemonComponent.setAttribute("pokeobject", pokemon);
        pokemonComponent.pokeObject = pokemon;
        this.showDisplayEl.appendChild(pokemonComponent);
      });
  }

  disconnectedCallback() {}

  attributeChangedCallback(attrName, oldVal, newVal) {}
}

customElements.define("app-pokemon-show", PokemonShowComponent);

export default PokemonShowComponent;
