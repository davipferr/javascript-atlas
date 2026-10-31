# Closures & IIFE

Functions that remember where they were born, and functions that run once immediately.

## Immediately Invoked Function Expressions (IIFE)

> `(function () { ... })()` defines and runs a function in one step, creating a private scope that runs only once.

```js
(function () {
  const secret = 'not global';
  initAnalytics(secret);
})();

(() => console.log('arrow IIFE'))();

// Async IIFE: use await in a classic script without top-level await
(async () => {
  const config = await fetch('/config.json').then((r) => r.json());
  startApp(config);
})();

// One-off computed value
const isMobile = (() => {
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad/.test(ua) || matchMedia('(pointer: coarse)').matches;
})();
```

::: tip When to use
Legacy scripts that must not leak globals, async start-up code in non-module scripts, and computing a constant with temporary variables. With ES modules and block scope (`{ }`), you need it much less.
:::

## Closures

> A closure is a function that keeps access to the variables of the scope it was created in, **even after that scope has finished**.

```js
function secureBooking() {
  let passengerCount = 0;               // private: nothing outside can touch it
  return function () {
    passengerCount++;
    return passengerCount;
  };
}

const booker = secureBooking();          // secureBooking has returned...
booker();   // 1                         // ...but the inner function still sees passengerCount
booker();   // 2
console.dir(booker);                     // [[Scopes]] → Closure { passengerCount }
```

**How it works:** a function always has access to the **variable environment of the execution context in which it was created**. That link has priority over the scope chain and survives the parent's return.

::: tip When to use
You use closures constantly without naming them: callbacks that read outer variables, event handlers, timers, factories. Use them on purpose for **private state** and **pre-configured functions**.
:::

## Closures in Practice: Private State

> Closures give you real privacy without classes: only the returned functions can read or change the captured variables.

```js
function createCounterStore(initial = 0) {
  let count = initial;
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn(count));

  return {
    get: () => count,
    increment() { count++; emit(); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }  // returns "unsubscribe"
  };
}

const cartCount = createCounterStore();
const unsubscribe = cartCount.subscribe((n) => (badge.textContent = n));
cartCount.increment();
unsubscribe();
```

::: tip When to use
Small stores, caches, rate limiters, ID generators, and anything where you want to expose an API but hide the data.
:::

## Debounce and Throttle <Badge type="tip" text="extra" />

> Classic closure utilities: **debounce** waits until calls stop for N ms; **throttle** allows at most one call every N ms.

```js
function debounce(fn, ms = 300) {
  let timer;                                    // captured between calls
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function throttle(fn, ms = 200) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}

searchInput.addEventListener('input', debounce((e) => searchProducts(e.target.value), 400));
window.addEventListener('scroll', throttle(updateProgressBar, 100));
window.addEventListener('resize', debounce(recalcLayout, 250));
```

::: tip When to use
Debounce: search-as-you-type, autosave, resize recalculation. Throttle: scroll/mousemove handlers, analytics pings, rate-limited buttons.
:::

## Memoize and once <Badge type="tip" text="extra" />

> Closures can cache results (`memoize`) or guarantee a function runs a single time (`once`).

```js
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}
const getCountry = memoize((code) => fetch(`/api/countries/${code}`).then((r) => r.json()));
getCountry('PT'); getCountry('PT');   // one request: the promise itself is cached

function once(fn) {
  let done = false, result;
  return (...args) => (done ? result : ((done = true), (result = fn(...args))));
}
const initMap = once(() => new Map3D('#map'));
```

::: tip When to use
Memoize: expensive pure calculations, de-duplicating identical requests. Once: lazy initialization of SDKs, maps, analytics, or "submit" handlers that must not fire twice.
:::

## More Closure Examples (Gotchas)

> Closures capture **variables, not values**, and they're created even when you don't return the function, e.g. with timers or reassignment.

```js
// 1. A function assigned to an outer variable still closes over its birthplace
let f;
const g = () => { const a = 23; f = () => a * 2; };
g();
f();   // 46

// 2. Timer callbacks close over the outer function's variables
function boardPassengers(n, wait) {
  const perGroup = n / 3;
  setTimeout(() => console.log(`Boarding ${perGroup} per group`), wait * 1000);
}

// 3. Stale closures (React hooks): the callback sees the value from its render
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000); // ❌ always uses the first count
  return () => clearInterval(id);
}, []);
// ✅ setCount((c) => c + 1)
```

::: warning Gotcha
A closure keeps its captured variables alive in memory. Closures attached to long-lived listeners or caches can hold onto large objects. Remove listeners and clear caches when they're no longer needed.
:::
