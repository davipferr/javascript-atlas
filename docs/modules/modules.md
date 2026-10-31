# Modules

Splitting code into files with ES modules, plus the patterns that came before them.

## An Overview of Modules

> A module is a file with its own scope that **exports** a public API and **imports** what it depends on. Nothing leaks to the global scope.

| | ES module | Classic script |
| --- | --- | --- |
| Top-level variables | Scoped to the module | Global |
| Default mode | Strict | Sloppy |
| Top-level `this` | `undefined` | `window` |
| `import` / `export` | ✅ | ❌ |
| Top-level `await` | ✅ | ❌ |
| Loading | Async, deferred by default | Blocking unless `defer`/`async` |
| HTML | `<script type="module">` | `<script>` |

**Benefits:** composition from small building blocks, isolation (change one module without breaking others), clear dependencies, reuse across projects, and tree-shaking by bundlers.

::: tip When to use
Every new project. Imports are hoisted and resolved before any code runs, which is what lets bundlers analyze and tree-shake the dependency graph.
:::

## Exporting and Importing in ES Modules

> **Named exports** (`export const x`) are imported by name in braces. A **default export** (one per module) is imported with any name you choose.

```js
// cart.js
const shippingCost = 10;                       // private to the module
export const cart = [];

export const addToCart = (product, quantity) => {
  cart.push({ product, quantity });
};

const totalPrice = 237;
const totalQuantity = 23;
export { totalPrice, totalQuantity as tq };    // export a list, with rename

export default function formatCart() { /* ... */ }
```

```js
// main.js
import formatCart, { addToCart, totalPrice as price, tq } from './cart.js';
import * as Cart from './cart.js';             // namespace object
Cart.addToCart('bread', 5);

// Imports are LIVE bindings, not copies
import { cart } from './cart.js';
addToCart('pizza', 2);
cart.length;                                   // 1: same array the module mutated

// Dynamic import: load on demand, returns a promise
btnExport.addEventListener('click', async () => {
  const { exportToPdf } = await import('./pdf-export.js');   // separate chunk
  exportToPdf(report);
});
```

::: tip When to use
Prefer **named exports** for utilities and components (better autocomplete, refactoring, tree-shaking). Use `import()` for heavy, rarely used features (PDF export, charts, admin panels, editors) to shrink the initial bundle.
:::

## Top-Level await

> In ES modules you can use `await` outside any `async` function. The module **blocks** its importers until the awaited promise settles.

```js
// config.js
const res = await fetch('/config.json');
export const config = await res.json();

// main.js: config is guaranteed to be loaded when this runs
import { config } from './config.js';
initApp(config);

// Conditional dependencies
const { default: i18n } = await import(`./locales/${navigator.language.slice(0, 2)}.js`).catch(
  () => import('./locales/en.js')
);
```

::: warning Gotcha
Top-level `await` blocks **everything that imports the module**. A slow request in a shared module delays the whole app. Use it for genuinely required start-up data only.
:::

::: tip When to use
Loading config, feature flags or translations before the app starts, initializing a WASM module, and quick scripts.
:::

## The Module Pattern

> Before ES modules, an IIFE returning an object created a private scope with a public API. Closures keep the private state alive.

```js
const ShoppingCart = (function () {
  const cart = [];
  const shippingCost = 10;          // private
  const totalPrice = 237;

  const addToCart = (product, quantity) => {
    cart.push({ product, quantity });
    console.log(`${quantity} ${product} added (shipping is ${shippingCost})`);
  };

  return { addToCart, cart, totalPrice };   // public API
})();

ShoppingCart.addToCart('apple', 4);
ShoppingCart.shippingCost;          // undefined
```

::: tip When to use
Reading legacy code, jQuery plugins and UMD bundles. In new code, a module file gives you the same privacy for free.
:::

## CommonJS Modules

> Node.js' original module system: `require()` to import and `module.exports` / `exports` to export. Synchronous and evaluated at runtime.

```js
// cart.cjs
const items = [];
exports.addToCart = (p) => items.push(p);
module.exports.total = () => items.length;

// app.cjs
const { addToCart } = require('./cart.cjs');
const express = require('express');
```

| | ES modules | CommonJS |
| --- | --- | --- |
| Syntax | `import` / `export` | `require` / `module.exports` |
| Loading | Static, async | Dynamic, sync |
| Tree-shakable | Yes | Hardly |
| Node.js | `.mjs`, or `"type": "module"` in package.json | `.cjs`, or the default |
| Browsers | Native | Needs a bundler |

::: tip When to use
Older Node.js projects, config files (`.cjs`), and packages that haven't migrated. New Node and browser code should be ESM.
:::
