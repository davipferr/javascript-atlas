# Spread & Rest

The same `...` syntax does opposite jobs: **spread** unpacks, **rest** packs.

## The Spread Operator

> `...iterable` expands an array (or any iterable) into individual elements, and `...object` copies its properties into a new object.

```js
const base = [7, 8, 9];
const all = [1, 2, ...base];                 // [1, 2, 7, 8, 9]

// Copy and merge arrays
const copy = [...cart];
const merged = [...frontendTasks, ...backendTasks];

// Pass array items as arguments
Math.max(...prices);
new Date(...[2026, 9, 30]);

// Any iterable: strings, Sets, Maps, NodeLists
const letters = [...'hello'];                // ['h','e','l','l','o']
const unique = [...new Set(tags)];
const buttons = [...document.querySelectorAll('button')];

// Objects (ES2018): later keys win
const defaults = { theme: 'light', lang: 'en', pageSize: 20 };
const settings = { ...defaults, ...userPrefs, lang: 'pt' };

// Immutable updates
const updated = { ...order, status: 'shipped' };
const added = [...todos, newTodo];
```

::: tip When to use
Shallow copies, merging configs with defaults, immutable state updates, converting iterables to arrays, passing arrays to variadic functions. Remember it's [shallow](/behind-the-scenes/memory#shallow-copies).
:::

## The Rest Pattern

> In destructuring, `...rest` collects the **remaining** elements or properties into a new array/object. It must be the last element.

```js
const [first, second, ...others] = [1, 2, 3, 4, 5];  // others = [3, 4, 5]

// Omit properties without mutating: remove secrets before sending to the client
const { password, ...publicUser } = userFromDb;
res.json(publicUser);

// Split known props from the rest (component wrappers)
function Button({ variant = 'primary', children, ...htmlAttrs }) {
  return `<button class="btn btn--${variant}" ${toAttrs(htmlAttrs)}>${children}</button>`;
}

const [head, ...tail] = breadcrumbs;
```

::: tip When to use
Stripping fields (`password`, internal IDs) from objects, forwarding unknown props in UI components, splitting the first item from the rest.
:::

## Rest Parameters

> `function f(...args)` gathers any number of arguments into a real array. It replaces the old `arguments` object.

```js
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
sum(2, 3);            // 5
sum(5, 3, 7, 2);      // 17
sum(...prices);       // spread in, rest out

// Required params first, then the rest
function addClasses(el, ...classNames) {
  el.classList.add(...classNames);
}
addClasses(card, 'card', 'card--active', 'shadow');

// Logger wrapper forwarding everything
const log = (level, ...details) => console[level](`[${new Date().toISOString()}]`, ...details);
log('warn', 'Low stock', { sku: 'A1', qty: 2 });
```

| Spread | Rest |
| --- | --- |
| On the **right** of `=` or in a call | On the **left** of `=` or in parameters |
| Unpacks values | Packs values |
| `fn(...arr)`, `[...a, ...b]`, `{...obj}` | `const [a, ...rest] = arr`, `function f(...args)` |

::: tip When to use
Variadic helpers (`sum`, `log`, `merge`, `classNames`), wrappers that forward arguments to another function.
:::
