# MVC & Publisher-Subscriber

Structuring a vanilla JavaScript application so business logic, UI and wiring stay separate.

## Project Architecture

> Architecture gives code **structure**, keeps it **maintainable** as it grows, and makes it **expandable** with new features. Every app has to organize the same four concerns.

| Concern | Responsibility | Examples |
| --- | --- | --- |
| Business logic | Solves the actual problem | Pricing rules, validation, calculations |
| State | Data the app holds in memory | Current recipe, search results, bookmarks |
| HTTP library | Talks to the outside world | `fetch` wrappers, API clients |
| Presentation logic | The visible part, reacting to user input | Rendering, DOM events |

**Planning a project:** user stories ("As a user I want to… so that…") → features → flowchart → architecture → implement.

::: tip When to use
As soon as an app has more than one screen or one data source. Frameworks (React, Vue, Angular) are pre-made answers to this question.
:::

## The MVC Architecture

> **Model** holds state, business logic and HTTP. **View** renders and listens to DOM events. **Controller** connects them: it's the only part that knows about both.

```text
User ─▶ View (DOM events) ─▶ Controller ─▶ Model (state, API)
                 ▲                │
                 └──── render ◀───┘
```

```js
// model.js: state + business logic + API. No DOM.
export const state = { recipe: {}, search: { query: '', results: [], page: 1 }, bookmarks: [] };

export const loadRecipe = async (id) => {
  const { data } = await getJSON(`${API_URL}${id}`);
  state.recipe = createRecipeObject(data);
  state.recipe.bookmarked = state.bookmarks.some((b) => b.id === id);
};

export const updateServings = (newServings) => {
  state.recipe.ingredients.forEach((ing) => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};
```

```js
// controller.js: glue. Gets data from the model and hands it to views.
import * as model from './model.js';
import recipeView from './views/recipeView.js';

const controlRecipes = async () => {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    await model.loadRecipe(id);
    recipeView.render(model.state.recipe);
  } catch {
    recipeView.renderError();
  }
};

const controlServings = (newServings) => {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
};
```

::: tip When to use
Vanilla JS apps of any real size, and as a mental model for frameworks: stores/composables ≈ model, components ≈ views, and route/page components or actions ≈ controller.
:::

## A Base View Class

> Put shared rendering logic (render, spinner, errors, clear) in a parent `View` class and let each view extend it with its own markup.

```js
// views/View.js
export default class View {
  _data;
  _errorMessage = 'Something went wrong.';

  render(data) {
    if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();
    this._data = data;
    this._parentElement.innerHTML = this._generateMarkup();
  }

  renderSpinner() {
    this._parentElement.innerHTML = '<div class="spinner"></div>';
  }

  renderError(message = this._errorMessage) {
    this._parentElement.innerHTML = `<div class="error"><p>${message}</p></div>`;
  }
}

// views/resultsView.js
class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes found for your query. Please try again!';

  _generateMarkup() {
    return this._data.map((r) => `<li><a href="#${r.id}">${r.title}</a></li>`).join('');
  }
}
export default new ResultsView();   // export a single instance
```

::: tip When to use
Any set of UI pieces that share behavior (loading, error, empty states). It's the same idea as base components in frameworks.
:::

## Event Handlers in MVC: Publisher-Subscriber

> The view **publishes** "something happened" through an `addHandler*` method; the controller **subscribes** by passing its function at init. Views never import the controller.

```js
// recipeView.js: knows about the DOM event, not about what to do with it
addHandlerRender(handler) {
  ['hashchange', 'load'].forEach((ev) => window.addEventListener(ev, handler));
}

addHandlerUpdateServings(handler) {
  this._parentElement.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn--update-servings');
    if (!btn) return;
    const updateTo = Number(btn.dataset.updateTo);
    if (updateTo > 0) handler(updateTo);
  });
}

// controller.js: subscribes at start-up
const init = () => {
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
};
init();
```

::: tip When to use
Whenever UI code needs to trigger logic without depending on it: views, widgets and components emitting events. Same pattern as props callbacks (`onSelect`) in React or `emit` in Vue.
:::

## Helpers and Configuration Files

> Keep reusable utilities in `helpers.js` and magic values in `config.js`, so they're changed in one place.

```js
// config.js
export const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes/';
export const TIMEOUT_SEC = 10;
export const RES_PER_PAGE = 10;
export const MODAL_CLOSE_SEC = 2.5;

// helpers.js
import { TIMEOUT_SEC } from './config.js';

const timeout = (s) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(`Request took too long! Timeout after ${s} seconds`)), s * 1000));

export const AJAX = async (url, uploadData) => {
  const fetchPro = uploadData
    ? fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(uploadData) })
    : fetch(url);

  const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
  const data = await res.json();
  if (!res.ok) throw new Error(`${data.message} (${res.status})`);
  return data;
};
```

::: tip When to use
Every project: API URLs, page sizes, timeouts and feature flags in config (or `.env`), and one shared HTTP helper that every model function uses.
:::

## Pagination and State-Driven UI

> Store the current page in state and derive the visible slice and buttons from it, instead of tracking UI details in the DOM.

```js
// model.js
export const getSearchResultsPage = (page = state.search.page) => {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

// paginationView.js
_generateMarkup() {
  const curPage = this._data.page;
  const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
  const prev = curPage > 1 ? `<button data-goto="${curPage - 1}" class="btn--prev">Page ${curPage - 1}</button>` : '';
  const next = curPage < numPages ? `<button data-goto="${curPage + 1}" class="btn--next">Page ${curPage + 1}</button>` : '';
  return prev + next;
}
```

::: tip When to use
Lists, tables, filters, wizards. Keep "where am I?" in state, and the UI becomes a function of that state. This is the core idea behind every modern UI framework.
:::

## Updating the DOM Efficiently

> Instead of replacing the whole markup, generate the new markup in memory, compare it to the current DOM, and only patch the nodes that changed.

```js
update(data) {
  this._data = data;
  const newMarkup = this._generateMarkup();

  const newDOM = document.createRange().createContextualFragment(newMarkup);
  const newElements = [...newDOM.querySelectorAll('*')];
  const curElements = [...this._parentElement.querySelectorAll('*')];

  newElements.forEach((newEl, i) => {
    const curEl = curElements[i];
    // Update changed TEXT
    if (!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== '') {
      curEl.textContent = newEl.textContent;
    }
    // Update changed ATTRIBUTES
    if (!newEl.isEqualNode(curEl)) {
      [...newEl.attributes].forEach((attr) => curEl.setAttribute(attr.name, attr.value));
    }
  });
}
```

::: tip When to use
Small vanilla apps where re-rendering causes flicker or lost focus/scroll (servings counters, bookmarks, selection highlights). This is a mini version of what virtual-DOM libraries do, and you'd reach for one (Preact, lit-html) beyond this point.
:::
