# Memory, References & Copies

Where values are stored, why objects behave differently from primitives, and how to copy them safely.

## Primitives vs Objects in Memory

> Primitives are stored by **value**; objects live in the **heap** and variables hold a **reference** to them. Copying an object variable copies the reference, not the object.

```js
// Primitives: independent copies
let age = 30;
let oldAge = age;
age = 31;
oldAge;              // 30

// Objects: both variables point to the same object
const me = { name: 'Ana', age: 30 };
const friend = me;
friend.age = 27;
me.age;              // 27 😱

// const only protects the binding, not the object
const settings = { theme: 'dark' };
settings.theme = 'light';  // ✅ allowed
// settings = {};          // ❌
```

| | Primitives | Objects (arrays, functions, dates…) |
| --- | --- | --- |
| Stored | By value (in the execution context) | In the heap; variable holds a reference |
| `=` copies | The value | The reference |
| Compared with `===` | By value | By reference (same object?) |
| Mutable | No | Yes |

::: tip When to use
This is the root of state bugs in React/Vue/Redux: mutating an object in place keeps the same reference, so change detection can miss it. Create new objects instead.
:::

## Shallow Copies

> Spread (`{...obj}`, `[...arr]`) and `Object.assign` copy only the **first level**. Nested objects are still shared.

```js
const user = { name: 'Ana', address: { city: 'Lisbon' }, tags: ['vip'] };

const copy = { ...user, name: 'Bia' };
copy.name;                    // 'Bia', user.name still 'Ana' ✅
copy.address.city = 'Porto';  // ❌ also changes user.address.city
copy.tags.push('beta');       // ❌ also changes user.tags

// Immutable nested update: spread at every level you change
const moved = { ...user, address: { ...user.address, city: 'Porto' } };
const tagged = { ...user, tags: [...user.tags, 'beta'] };
```

::: tip When to use
Updating state immutably (React `setState`, Redux reducers, Pinia patches): spread each level along the path you're changing.
:::

## Deep Copies with structuredClone <Badge type="tip" text="extra" />

> `structuredClone(value)` creates a fully independent deep copy, including nested objects, arrays, `Date`, `Map`, `Set` and circular references.

```js
const draft = structuredClone(invoice);     // edit a form without touching the original
draft.lines[0].qty = 5;
invoice.lines[0].qty;                       // unchanged ✅

// Old trick: JSON round-trip. Loses Dates, Maps, undefined, functions
const bad = JSON.parse(JSON.stringify(invoice));
typeof bad.createdAt;   // 'string', not Date

// structuredClone can't copy functions, DOM nodes or class prototypes
structuredClone({ fn() {} });   // ❌ DataCloneError
```

::: tip When to use
"Cancel" support for edit forms (clone, edit, discard), snapshotting state for undo/redo, and safely duplicating fetched data before mutating it.
:::

## Garbage Collection

> The engine frees heap memory automatically using **mark-and-sweep**: anything not reachable from a root (globals, the call stack, active closures, the DOM) is collected.

```js
let user = { name: 'Ana' };
user = null;        // the object is unreachable → eligible for GC

// Common leaks in web apps: things still reachable that you forgot about
// 1. Listeners on long-lived elements capturing big data
window.addEventListener('resize', () => recalc(hugeDataset));

// 2. Timers never cleared
const id = setInterval(poll, 1000);
// later: clearInterval(id)

// 3. Ever-growing caches and detached DOM nodes kept in arrays
const cache = new Map();          // grows forever unless you evict

// Fix patterns
const controller = new AbortController();
window.addEventListener('resize', onResize, { signal: controller.signal });
controller.abort();               // removes every listener registered with this signal
```

::: tip When to use
SPAs and dashboards that stay open for hours: clean up listeners, intervals, observers and subscriptions when a component unmounts. Use DevTools → Memory → heap snapshots to find leaks.
:::

## WeakMap and WeakRef <Badge type="tip" text="extra" />

> A `WeakMap` holds keys **weakly**: if the key object becomes unreachable elsewhere, the entry disappears automatically.

```js
// Attach metadata to DOM nodes without leaking them
const tooltipData = new WeakMap();
tooltipData.set(buttonEl, { text: 'Save', shown: 0 });
// When buttonEl is removed from the DOM and dropped, its entry is collected too

// Per-object caches
const sizeCache = new WeakMap();
function measure(el) {
  if (!sizeCache.has(el)) sizeCache.set(el, el.getBoundingClientRect());
  return sizeCache.get(el);
}
```

::: tip When to use
Caches or metadata keyed by objects (DOM nodes, component instances, request objects) that shouldn't keep those objects alive.
:::
