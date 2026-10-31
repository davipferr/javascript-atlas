# async/await & Combinators

Building your own Promises, writing async code that reads like sync code, and running promises in parallel.

## Building a Simple Promise

> `new Promise((resolve, reject) => { ... })` wraps any async operation. Call `resolve(value)` on success and `reject(error)` on failure.

```js
const lotteryPromise = new Promise((resolve, reject) => {
  console.log('Lottery draw is happening 🔮');
  setTimeout(() => {
    Math.random() >= 0.5 ? resolve('You WIN 💰') : reject(new Error('You lost your money 💩'));
  }, 2000);
});
lotteryPromise.then(console.log).catch(console.error);

// Promisified delay
const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
wait(1).then(() => console.log('1 second passed'));

// Already-settled promises
Promise.resolve(cachedValue);
Promise.reject(new Error('Not allowed'));
```

::: tip When to use
Wrapping things that aren't promise-based yet: timers, events, old callback APIs, `Image` loading. If an API already returns a promise, don't wrap it again.
:::

## Promisifying Callback APIs

> Turn a callback-based API into a promise-returning function by calling `resolve`/`reject` from its callbacks.

```js
const getPosition = (options) =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  );

// Load an image
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () => reject(new Error(`Image not found: ${src}`)));
  });

// Wait for the next occurrence of an event
const once = (el, event) => new Promise((resolve) => el.addEventListener(event, resolve, { once: true }));
await once(dialog, 'close');

// Expose resolve/reject outside (ES2024)
const { promise, resolve } = Promise.withResolvers();
confirmBtn.onclick = () => resolve(true);
cancelBtn.onclick = () => resolve(false);
const confirmed = await promise;   // custom confirm dialog
```

::: tip When to use
Geolocation, image preloading, waiting for animations/transitions (`transitionend`), custom confirm dialogs and Node-style `(err, data)` callbacks.
:::

## Consuming Promises with async/await

> An `async` function always returns a promise. Inside it, `await promise` pauses **that function** (not the thread) until the promise settles, then returns its value.

```js
const whereAmI = async () => {
  const { coords: { latitude: lat, longitude: lng } } = await getPosition();

  const resGeo = await fetch(`https://geocode.dev/reverse?lat=${lat}&lng=${lng}`);
  const { countryName } = await resGeo.json();

  const res = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
  const [country] = await res.json();
  renderCountry(country);
};

whereAmI();
console.log('FIRST');   // runs before the async function finishes
```

::: tip When to use
Default style for all promise-based code. It reads top to bottom, works with normal loops and `try/catch`, and stack traces are clearer than long `.then` chains.
:::

## Error Handling with try...catch

> Wrap `await` calls in `try { } catch (err) { }`. A rejected promise becomes a thrown error at the `await` line.

```js
async function loadDashboard() {
  try {
    showSpinner();
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error(`Dashboard failed (${res.status})`);
    const data = await res.json();
    renderDashboard(data);
  } catch (err) {
    console.error(err);
    renderError(err.message);
  } finally {
    hideSpinner();
  }
}

// Handle specific error types differently
try {
  await saveProfile(form);
} catch (err) {
  if (err instanceof ValidationError) showFieldErrors(err.fields);
  else if (err.name === 'AbortError') return;          // user cancelled
  else showToast('Could not save. Try again.');
}
```

::: tip When to use
Around every awaited operation that can fail and where you can do something useful (show an error, fall back, retry). Let errors bubble up when the caller is better placed to handle them.
:::

## Returning Values from async Functions

> Whatever you `return` from an `async` function becomes the fulfilled value of its promise; whatever you `throw` becomes the rejection. Re-throw in `catch` so callers know it failed.

```js
const whereAmI = async () => {
  try {
    const pos = await getPosition();
    const { city, country } = await reverseGeocode(pos);
    return `You are in ${city}, ${country}`;
  } catch (err) {
    console.error(err);
    throw err;                       // re-throw: otherwise the promise FULFILLS with undefined
  }
};

// Consume with await inside an async IIFE (or top-level await in modules)
(async () => {
  try {
    const where = await whereAmI();
    console.log(where);
  } catch (err) {
    console.error(`2: ${err.message}`);
  }
  console.log('3: Finished getting location');
})();
```

::: tip When to use
Service/repository functions (`getUser`, `createOrder`) that return data to UI code. Catch to log or translate errors, then re-throw so the UI can react.
:::

## Running Promises in Parallel (Promise.all)

> Start independent promises together and `await Promise.all([...])`. Total time is the slowest one, not the sum. If **any** rejects, `Promise.all` rejects immediately.

```js
// ❌ Sequential: ~3 × request time
const user = await getJSON(`/api/users/${id}`);
const orders = await getJSON(`/api/users/${id}/orders`);
const recs = await getJSON(`/api/users/${id}/recommendations`);

// ✅ Parallel: ~1 × request time
const [user2, orders2, recs2] = await Promise.all([
  getJSON(`/api/users/${id}`),
  getJSON(`/api/users/${id}/orders`),
  getJSON(`/api/users/${id}/recommendations`)
]);

// Map over a list in parallel
const products = await Promise.all(ids.map((id) => getJSON(`/api/products/${id}`)));
```

::: tip When to use
Loading independent data for a page (user + settings + notifications), fetching details for a list of IDs, uploading several files. For huge lists, limit concurrency (batch in chunks) so you don't flood the server.
:::

## Other Combinators: race, allSettled and any

> `Promise.race` settles with the **first** settled promise; `allSettled` waits for **all** and never rejects; `any` returns the first **fulfilled** one and ignores rejections.

```js
// race: timeout for a request
const timeout = (s) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request took too long!')), s * 1000));
const data = await Promise.race([getJSON('/api/slow-report'), timeout(5)]);
// Modern alternative: fetch(url, { signal: AbortSignal.timeout(5000) })

// allSettled: a dashboard where each widget may fail independently
const results = await Promise.allSettled([loadSales(), loadTraffic(), loadSupport()]);
results.forEach((r, i) =>
  r.status === 'fulfilled' ? renderWidget(i, r.value) : renderWidgetError(i, r.reason)
);

// any: fastest mirror / CDN that works
const config = await Promise.any([
  getJSON('https://cdn-eu.example.com/config.json'),
  getJSON('https://cdn-us.example.com/config.json')
]);
```

| Combinator | Resolves when | Rejects when |
| --- | --- | --- |
| `Promise.all` | All fulfill → array of values | Any rejects (fail fast) |
| `Promise.allSettled` | All settle → array of `{status, value/reason}` | Never |
| `Promise.race` | First settles (fulfill) | First settles (reject) |
| `Promise.any` | First fulfills | All reject (`AggregateError`) |

::: tip When to use
`race` for timeouts, `allSettled` for independent widgets or bulk operations with per-item reporting, `any` for redundant sources.
:::

## Cancelling Requests with AbortController <Badge type="tip" text="extra" />

> Pass `controller.signal` to `fetch`; calling `controller.abort()` cancels the request and rejects with an `AbortError`.

```js
// Search-as-you-type: cancel the previous request when a new one starts
let controller;
searchInput.addEventListener('input', async (e) => {
  controller?.abort();
  controller = new AbortController();
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(e.target.value)}`, { signal: controller.signal });
    renderResults(await res.json());
  } catch (err) {
    if (err.name !== 'AbortError') renderError(err);
  }
});

// Built-in timeout
await fetch('/api/report', { signal: AbortSignal.timeout(8000) });
```

::: tip When to use
Search boxes and filters (avoid out-of-order results), leaving a page/unmounting a component, timeouts and user "Cancel" buttons on uploads.
:::
