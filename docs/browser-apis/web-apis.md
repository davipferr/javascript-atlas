# Storage, Geolocation & More

Browser APIs used in real apps: persisting data, getting the user's location, hash-based routing and plugging in third-party libraries.

## localStorage

> `localStorage` stores **strings** per origin that survive reloads and browser restarts. Serialize objects with `JSON.stringify` and read them back with `JSON.parse`.

```js
// Persist and restore app state
function saveWorkouts(workouts) {
  localStorage.setItem('workouts', JSON.stringify(workouts));
}

function loadWorkouts() {
  try {
    return JSON.parse(localStorage.getItem('workouts')) ?? [];
  } catch {
    return [];      // corrupted data or storage blocked (private mode, quota)
  }
}

// Theme preference
const theme = localStorage.getItem('theme') ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.dataset.theme = theme;

localStorage.removeItem('workouts');
localStorage.clear();

// Sync between tabs: fires in OTHER tabs of the same origin
window.addEventListener('storage', (e) => {
  if (e.key === 'cart') renderCart(JSON.parse(e.newValue));
});
```

::: warning Gotchas
- **Synchronous** and blocks the main thread, so keep it small (~5 MB limit). For big data use IndexedDB.
- JSON loses prototypes: objects restored from storage are plain objects, not class instances. Rebuild them (`new Workout(data)`) if you need methods.
- Never store tokens or secrets you can't afford to leak. Any script on the page (XSS) can read it.
:::

::: tip When to use
User preferences (theme, language, dismissed banners), small caches, drafts, bookmarks, recently viewed items.
:::

## sessionStorage <Badge type="tip" text="extra" />

> Same API as `localStorage`, but scoped to the **tab** and cleared when the tab closes.

```js
// Keep a multi-step form alive across reloads, but not forever
form.addEventListener('input', () =>
  sessionStorage.setItem('checkout-draft', JSON.stringify(Object.fromEntries(new FormData(form))))
);

// Restore scroll position after navigating back
sessionStorage.setItem(`scroll:${location.pathname}`, String(scrollY));
```

::: tip When to use
Wizard/checkout progress, per-tab filters, one-time flags like "already showed the welcome modal this visit".
:::

## The Geolocation API

> `navigator.geolocation.getCurrentPosition(success, error, options)` asks permission and returns the user's coordinates asynchronously.

```js
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude, accuracy } }) => {
      showNearbyStores(latitude, longitude);
    },
    (err) => {
      // err.code: 1 PERMISSION_DENIED, 2 POSITION_UNAVAILABLE, 3 TIMEOUT
      showManualAddressInput();
    },
    { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
  );
}

// Promise wrapper (see async/await)
const getPosition = (opts) =>
  new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, opts));

// Continuous tracking (delivery driver, run tracker)
const watchId = navigator.geolocation.watchPosition(({ coords }) => updateMarker(coords));
navigator.geolocation.clearWatch(watchId);
```

::: tip When to use
"Stores near me", pre-filling a city/country, delivery tracking, check-ins. Only works on HTTPS, and you should only ask after a user action, with a manual fallback.
:::

## Using Third-Party Libraries

> Libraries like Leaflet (maps), Chart.js or date-fns are loaded via npm + import (preferred) or a CDN `<script>`, then used through their documented API.

```js
// npm install leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const map = L.map('map').setView([38.72, -9.14], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

map.on('click', ({ latlng }) => {
  L.marker(latlng).addTo(map).bindPopup('Workout here').openPopup();
});

// Move to a marker when a list item is clicked (delegation + data attribute)
list.addEventListener('click', (e) => {
  const item = e.target.closest('[data-id]');
  if (!item) return;
  const workout = workouts.find((w) => w.id === item.dataset.id);
  map.setView(workout.coords, 13, { animate: true, pan: { duration: 1 } });
});
```

**Choosing a library:** check bundle size (bundlephobia), maintenance activity, TypeScript types, license and whether a native API already covers it (`Intl` vs moment.js, `fetch` vs axios).

::: tip When to use
Maps, charts, rich text editors, date pickers: problems that are big and well solved. Wrap the library behind your own small module so you can swap it later.
:::

## Hash Routing: hashchange and load

> Changing `location.hash` doesn't reload the page. Listening to `hashchange` (and `load` for the first visit) gives you a tiny client-side router.

```js
// URLs like https://app.dev/#5ed6604591c37cdc054bc886
const controlRecipe = async () => {
  const id = window.location.hash.slice(1);
  if (!id) return;
  renderSpinner();
  const recipe = await loadRecipe(id);
  renderRecipe(recipe);
};

['hashchange', 'load'].forEach((ev) => window.addEventListener(ev, controlRecipe));

// Update the URL without reloading
window.location.hash = recipe.id;

// History API: clean URLs without the #
history.pushState(null, '', `/recipes/${recipe.id}`);
window.addEventListener('popstate', renderFromUrl);   // back/forward buttons
```

::: tip When to use
Shareable/bookmarkable app state (selected item, open tab, filters) in vanilla JS apps and static sites like GitHub Pages, where the server can't rewrite routes. Frameworks' routers use the History API for the same thing.
:::

## URL and URLSearchParams <Badge type="tip" text="extra" />

> `URL` parses and builds URLs; `URLSearchParams` reads and writes query strings with encoding handled for you.

```js
const params = new URLSearchParams(location.search);
const page = Number(params.get('page')) || 1;
const tags = params.getAll('tag');           // ?tag=js&tag=css

// Sync filters to the URL so the page is shareable
function updateFilters(filters) {
  const url = new URL(location.href);
  Object.entries(filters).forEach(([k, v]) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k)));
  history.replaceState(null, '', url);
}

// Build API URLs safely
const api = new URL('/search', 'https://api.shop.dev');
api.searchParams.set('q', 'café & bar');     // encoded automatically
fetch(api);
```

::: tip When to use
Search pages, filters and pagination in the URL, building API requests with user input, and reading UTM/campaign parameters.
:::
