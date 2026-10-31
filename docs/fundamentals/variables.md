# Variables & Language Basics

How JavaScript stores values, which declaration keyword to use, and how the language versions itself.

## Values and Variables

> A value is a piece of data; a variable is a named label that points to a value. Names are camelCase and can't start with a digit or be a reserved word.

```js
const apiBaseUrl = 'https://api.shop.dev/v1';
let cartCount = 0;

// Descriptive names over short ones
const MAX_UPLOAD_MB = 25;          // UPPER_SNAKE for true constants known before runtime
const isLoggedIn = Boolean(token); // booleans read as questions: is/has/can/should
const $submitBtn = document.querySelector('#submit'); // $ prefix is a common hint for DOM nodes
```

**Naming conventions**
- `camelCase` for variables and functions, `PascalCase` for classes and constructor functions.
- `UPPER_SNAKE_CASE` for hard-coded configuration constants.
- Names like `name`, `event` or `status` exist on `window`; shadowing them works but can confuse you in the global scope.

::: tip When to use
Always name by **meaning**, not by type: `unpaidInvoices`, not `arr2`. Code is read far more often than it's written.
:::

## let, const and var

> `const` for bindings that never get reassigned, `let` for ones that do, and `var` only in legacy code. `let`/`const` are block-scoped; `var` is function-scoped.

```js
const user = { name: 'Ana' };
user.name = 'Bia';      // ✅ allowed: the object is mutable, the binding isn't
// user = {};           // ❌ TypeError: Assignment to constant variable

let retries = 0;
while (retries < 3) retries++;

// var leaks out of blocks and is hoisted as undefined
if (true) { var leaked = 'oops'; }
console.log(leaked);    // 'oops'

for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2 (new binding per iteration)
```

| | `var` | `let` | `const` |
| --- | --- | --- | --- |
| Scope | Function | Block | Block |
| Reassign | Yes | Yes | No |
| Redeclare in same scope | Yes | No | No |
| Hoisting | Hoisted as `undefined` | Hoisted, in TDZ | Hoisted, in TDZ |
| Creates `window` property (global) | Yes | No | No |

::: tip When to use
Default to `const`. Switch to `let` only when you actually reassign (counters, accumulators, state that changes). Treat `var` as a code smell in new code.
:::

## Strict Mode

> `'use strict'` at the top of a script or function turns silent mistakes into errors and forbids some unsafe features.

```js
'use strict';

let hasDriversLicense = false;
hasDriverLicense = true;   // ❌ ReferenceError instead of silently creating a global

function show() {
  console.log(this);       // undefined in strict mode (window in sloppy mode)
}

// const interface = 'x';  // ❌ reserved words for future features are blocked
```

**What strict mode changes**
- Assigning to an undeclared variable throws.
- `this` is `undefined` in plain function calls.
- Duplicate parameter names and writing to read-only properties throw.

::: info Already on by default
ES modules (`type="module"`, `import`/`export`) and `class` bodies are **always** strict. You only need the directive in classic scripts.
:::

::: tip When to use
Every classic `<script>` file you still write by hand. In a bundler/module setup you already have it.
:::

## JavaScript Releases: ES5, ES6+ and ESNext

> JavaScript is standardized as ECMAScript. ES6 (ES2015) was the big modernization; since then a smaller release ships every year.

| Release | Highlights |
| --- | --- |
| ES5 (2009) | `strict mode`, `Array.prototype.forEach/map/filter`, JSON |
| ES2015 (ES6) | `let`/`const`, arrows, classes, modules, Promises, template literals, destructuring, Map/Set |
| ES2017 | `async`/`await`, `Object.entries/values` |
| ES2018 | Object rest/spread, `Promise.finally` |
| ES2020 | `?.`, `??`, `BigInt`, `Promise.allSettled`, `globalThis` |
| ES2021 | `??=`, `||=`, `&&=`, `replaceAll`, numeric separators, `Promise.any` |
| ES2022 | Top-level `await`, `#private` fields, `.at()`, `Object.hasOwn` |
| ES2023 | `findLast`, `toSorted`, `toReversed`, `toSpliced`, `with` |
| ES2024 | `Object.groupBy`, `Map.groupBy`, `Promise.withResolvers` |
| ES2025 | Set methods (`union`, `intersection`…), iterator helpers |

**Backwards compatibility:** browsers never remove old features ("don't break the web"), so ES5 code still runs today. New features don't run in old browsers, which is why you transpile and polyfill for production (see [npm, Bundlers & Babel](/modules/tooling)).

::: tip When to use
Check the year a feature landed (and [caniuse.com](https://caniuse.com)) before relying on it for an audience with older browsers, such as enterprise intranets or older mobile devices.
:::
