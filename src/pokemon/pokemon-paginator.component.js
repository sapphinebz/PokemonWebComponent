import { BehaviorSubject, combineLatest, fromEvent, defer } from "rxjs";
import { switchMap, tap, map } from "rxjs/operators";
import { ajax } from "rxjs/ajax";

class PokemonPaginatorComponent extends HTMLElement {
  offset$ = new BehaviorSubject(0);
  limit$ = new BehaviorSubject(10);
  count = 0;

  static get observedAttributes() {
    return ["limit", "offset"];
  }

  constructor() {
    super();
  }
  connectedCallback() {
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
   <style></style>
    <div>
        <button data-previous-button>previous page</button>
        <span data-paginator></span>
        <button data-next-button>next page</button>

    </div>
    `;

    combineLatest([this.offset$, this.limit$])
      .pipe(
        switchMap(([offset, limit]) => {
          return ajax
            .getJSON(
              `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
            )
            .pipe(
              tap((response) => {
                this.count = response.count;
                this.writePaginator();

                this.dispatchEvent(
                  new CustomEvent("loadedPokemon", { detail: response.results })
                );
              })
            );
        })
      )
      .subscribe((response) => console.log(response));

    const previousButtonEl = this.shadowRoot.querySelector(
      "[data-previous-button]"
    );
    fromEvent(previousButtonEl, "click").subscribe(() => {
      const currentOffset = this.offset$.value;
      const currentLimit = this.limit$.value;
      if (currentOffset - currentLimit >= 0) {
        this.offset$.next(currentOffset - currentLimit);
        this.writePaginator();
      }
    });

    const nextButtonEl = this.shadowRoot.querySelector("[data-next-button]");
    fromEvent(nextButtonEl, "click").subscribe(() => {
      const currentOffset = this.offset$.value;
      const currentLimit = this.limit$.value;
      if (currentOffset + currentLimit <= this.count) {
        this.offset$.next(currentOffset + currentLimit);
        this.writePaginator();
      }
    });
  }

  disconnectedCallback() {}

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === "offset") {
      this.offset$.next(+newVal);
    }
    if (attrName === "limit") {
      this.limit$.next(+newVal);
    }
  }

  writePaginator() {
    const limit = this.limit$.getValue();
    const offset = this.offset$.getValue();
    const countPage = Math.ceil(this.count / limit);
    const page = offset / limit + 1;
    this.shadowRoot.querySelector(
      "[data-paginator]"
    ).textContent = `${page}/${countPage}`;
  }
}

customElements.define("app-pokemon-paginator", PokemonPaginatorComponent);

export default PokemonPaginatorComponent;
