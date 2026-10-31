# Loops

Repeating work: classic `for`, `while`, `for...of`, `for...in`, and controlling them with `break` and `continue`.

## The for Loop

> `for (init; condition; update)` runs while the condition is true. Use it when you need the index or a custom step.

```js
// Build pagination buttons
for (let page = 1; page <= totalPages; page++) {
  nav.insertAdjacentHTML('beforeend', `<button data-page="${page}">${page}</button>`);
}

// Batching: process items 100 at a time
for (let i = 0; i < rows.length; i += 100) {
  await api.post('/import', rows.slice(i, i + 100));
}

// Filling a new array based on another
const lineTotals = [];
for (let i = 0; i < items.length; i++) {
  lineTotals.push(items[i].price * items[i].qty);
}
```

::: tip When to use
Custom steps (batching, every 2nd item), index-based work, or performance-critical hot loops. For plain "do something with each item" prefer `for...of` or array methods.
:::

## break and continue

> `continue` skips to the next iteration; `break` exits the loop entirely.

```js
// Skip invalid rows
for (const row of csvRows) {
  if (!row.email) continue;
  importContact(row);
}

// Stop at the first match
let firstOutOfStock = null;
for (const product of products) {
  if (product.stock === 0) {
    firstOutOfStock = product;
    break;
  }
}

// Labels let you break out of nested loops
outer: for (const row of grid) {
  for (const cell of row) {
    if (cell.hasMine) { revealAll(); break outer; }
  }
}
```

::: warning Gotcha
`break` and `continue` don't work inside `forEach`. If you need to stop early, use `for...of`, `some`, `find` or `every`.
:::

## Looping Backwards and Nested Loops

> Count down from `length - 1` to `0` to loop in reverse. A loop inside a loop handles 2D data.

```js
// Removing while iterating: go backwards so indexes don't shift
for (let i = notifications.length - 1; i >= 0; i--) {
  if (notifications[i].expired) notifications.splice(i, 1);
}

// Nested: a calendar month (weeks × days)
for (let week = 0; week < 6; week++) {
  const row = document.createElement('tr');
  for (let day = 0; day < 7; day++) {
    row.append(renderDayCell(week, day));
  }
  tbody.append(row);
}
```

::: tip When to use
Backwards: removing items in place, processing "most recent first" logs. Nested: grids, tables, matrices, comparing every pair. Watch the O(n²) cost on large lists.
:::

## The while Loop

> `while (condition)` repeats as long as the condition holds. Use it when you don't know in advance how many iterations you need.

```js
// Fetch all pages from a paginated API
let url = '/api/orders?page=1';
const all = [];
while (url) {
  const res = await fetch(url).then((r) => r.json());
  all.push(...res.data);
  url = res.next;            // null on the last page
}

// Retry with a limit
let attempts = 0;
let ok = false;
while (!ok && attempts < 3) {
  ok = await tryConnect();
  attempts++;
}

// do...while runs at least once
let code;
do {
  code = generateCode();
} while (usedCodes.has(code));
```

::: tip When to use
Cursor/next-page pagination, retries, polling, generating unique values, walking up a tree (`while (node = node.parentElement)`).
:::

## The for...of Loop

> `for (const item of iterable)` loops over the **values** of arrays, strings, Maps, Sets, NodeLists and any iterable.

```js
for (const item of cart) total += item.price * item.qty;

// Need the index too? use entries()
for (const [i, step] of wizardSteps.entries()) {
  console.log(`${i + 1}. ${step.title}`);
}

// Works on DOM collections
for (const input of form.querySelectorAll('input[required]')) {
  input.classList.toggle('invalid', !input.value);
}

// Sequential async work (forEach can't do this)
for (const file of files) {
  await upload(file);       // one after another
}
```

::: tip When to use
Default loop for iterating values, especially when you need `break`, `continue` or `await` inside the body.
:::

## The for...in Loop <Badge type="tip" text="extra" />

> `for (const key in object)` iterates over an object's enumerable **keys**, including inherited ones. Avoid it for arrays.

```js
const settings = { theme: 'dark', lang: 'pt' };
for (const key in settings) console.log(key, settings[key]);

// Modern, safer equivalent
for (const [key, value] of Object.entries(settings)) console.log(key, value);
```

::: tip When to use
Rarely. Prefer `Object.keys/values/entries` with `for...of` (see [Objects](/data-structures/objects#looping-objects-keys-values-and-entries)), which skip inherited properties.
:::
