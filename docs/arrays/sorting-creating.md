# Sorting, Grouping & Creating

Sorting with comparators, grouping, generating arrays, immutable variants and a cheat sheet.

## Sorting Arrays

> `arr.sort(compareFn)` sorts **in place** (mutates). Without a comparator it sorts as strings. The comparator returns negative (a first), positive (b first) or 0.

```js
['Zé', 'ana', 'Bia'].sort();          // ['Bia', 'Zé', 'ana']: by UTF-16, uppercase first
[200, 450, -400, 3000].sort();        // [-400, 200, 3000, 450] ❌ string sort!

// Numbers
movements.sort((a, b) => a - b);      // ascending
movements.sort((a, b) => b - a);      // descending

// Strings: human-friendly and locale-aware
users.sort((a, b) => a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' }));

// Dates
posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));   // newest first

// Multiple keys: status, then price
products.sort((a, b) => a.category.localeCompare(b.category) || a.price - b.price);

// Sortable table header
const sortBy = (key, dir = 1) => (a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0);
rows.sort(sortBy('createdAt', -1));
```

::: warning Gotcha
`sort` mutates the original array. Sorting state or props directly is a classic bug; use `toSorted` or `[...arr].sort()`.
:::

::: tip When to use
Sortable tables, leaderboards, "sort by price/date/name" dropdowns. Use `localeCompare` for any user-facing text.
:::

## Array Grouping

> `Object.groupBy(arr, fn)` returns an object whose keys are the callback's results; `Map.groupBy` returns a Map (keys can be any type).

```js
const grouped = Object.groupBy(movements, (mov) => (mov > 0 ? 'deposits' : 'withdrawals'));
// { deposits: [...], withdrawals: [...] }

// Group by activity level
const byActivity = Object.groupBy(accounts, ({ movements }) =>
  movements.length >= 8 ? 'very active' : movements.length >= 4 ? 'active' : 'inactive'
);

// Orders by status for a kanban board
const columns = Object.groupBy(orders, (o) => o.status);
for (const [status, list] of Object.entries(columns)) renderColumn(status, list);

// Map.groupBy: group by an object (e.g. the customer)
const byCustomer = Map.groupBy(orders, (o) => customersById.get(o.customerId));
```

::: tip When to use
Kanban columns, grouped lists (by date, category, letter), reports split by status. Note: the result object has a null prototype, so it's safe for any key.
:::

## More Ways of Creating and Filling Arrays

> `Array.from` builds arrays from iterables or `{ length }` with a mapping function; `fill` fills existing slots; `new Array(n)` creates empty slots.

```js
new Array(7);                   // [empty × 7]: map won't work on empty slots
new Array(7).fill(0);           // [0, 0, 0, 0, 0, 0, 0]
[1, 2, 3, 4].fill(9, 1, 3);     // [1, 9, 9, 4]

Array.from({ length: 7 }, () => 1);              // [1, 1, 1, ...]
Array.from({ length: 5 }, (_, i) => i + 1);      // [1, 2, 3, 4, 5]

// Pagination numbers, star ratings, skeleton loaders
const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
const stars = Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('');
const skeletons = Array.from({ length: 6 }, () => '<div class="skeleton"></div>').join('');

// Convert DOM collections and transform in one step
const amounts = Array.from(document.querySelectorAll('.movements__value'), (el) =>
  Number(el.textContent.replace('€', ''))
);

// Random dice rolls / test data
const rolls = Array.from({ length: 100 }, () => Math.trunc(Math.random() * 6) + 1);
```

::: tip When to use
Generating ranges, placeholder content, test data, and converting `NodeList`/`Set`/`Map`/strings into real arrays with mapping in one call.
:::

## Non-Destructive Alternatives: toSorted, toReversed, toSpliced, with

> ES2023 added copies of the mutating methods that **return a new array** and leave the original untouched.

```js
const sorted = movements.toSorted((a, b) => a - b);   // vs sort
const reversed = movements.toReversed();              // vs reverse
const withoutFirst2 = movements.toSpliced(0, 2);      // vs splice
const updated = movements.with(1, 2000);              // vs arr[1] = 2000

// Perfect for React/Vue state
setTodos((todos) => todos.with(index, { ...todos[index], done: true }));
setItems((items) => items.toSpliced(index, 1));
const view = useMemo(() => rows.toSorted(compare), [rows, compare]);
```

| Mutating | Non-destructive |
| --- | --- |
| `sort()` | `toSorted()` |
| `reverse()` | `toReversed()` |
| `splice()` | `toSpliced()` |
| `arr[i] = x` | `with(i, x)` |

::: tip When to use
Whenever the array is shared state (props, store, cache). They make immutable updates one-liners.
:::

## Summary: Which Array Method to Use?

> Pick by what you want back: a mutated original, a new array, an index, an element, a boolean, a string or a single value.

| I want… | Method |
| --- | --- |
| **Mutate** original: add | `push`, `unshift` |
| **Mutate** original: remove | `pop`, `shift`, `splice` |
| **Mutate** original: other | `reverse`, `sort`, `fill` |
| **New array** computed from original | `map` |
| **New array**, filtered | `filter` |
| **New array**, portion | `slice` |
| **New array**, with one item replaced | `with` |
| **New array**, flattened | `flat`, `flatMap` |
| **New array**, sorted / reversed / spliced | `toSorted`, `toReversed`, `toSpliced` |
| **New array**, joined | `concat`, `[...a, ...b]` |
| An **index** | `indexOf` (value), `findIndex`, `findLastIndex` (condition) |
| An **element** | `find`, `findLast`, `at` |
| **Know if it includes** | `includes` (value), `some`, `every` (condition) |
| A **string** | `join` |
| **Transform to one value** | `reduce` |
| **Group** | `Object.groupBy`, `Map.groupBy` |
| **Just loop** (side effects) | `forEach`, `for...of` |
