# Sets & Maps

The ES6 collections: `Set` for unique values, `Map` for key-value pairs with any key type.

## Sets

> A `Set` is a collection of **unique** values. Order is insertion order, and `has` is fast (O(1)), unlike `array.includes`.

```js
const orderStatuses = ['paid', 'shipped', 'paid', 'refunded', 'shipped'];
const uniqueStatuses = new Set(orderStatuses);   // Set { 'paid', 'shipped', 'refunded' }
uniqueStatuses.size;                             // 3

const unique = [...new Set(orderStatuses)];      // dedupe an array

// Track selections in a UI
const selectedIds = new Set();
function toggleRow(id) {
  selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id);
  bulkActions.hidden = selectedIds.size === 0;
}

// Fast membership checks
const blocked = new Set(blockedUserIds);
const visible = comments.filter((c) => !blocked.has(c.authorId));

new Set('banana').size;   // 3 unique letters
```

::: tip When to use
Deduplication, "is this selected/seen/visited?" checks, tags, and any time you'd call `array.includes` in a loop over a large array.
:::

## Set Operations

> ES2025 added `union`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`, `isSupersetOf` and `isDisjointFrom`.

```js
const required = new Set(['read', 'write']);
const userPerms = new Set(['read', 'write', 'delete']);
const adminPerms = new Set(['read', 'write', 'delete', 'manage']);

required.isSubsetOf(userPerms);              // true: user can do everything needed
adminPerms.difference(userPerms);            // Set { 'manage' }

const italianFoods = new Set(['pasta', 'garlic', 'tomatoes', 'olive oil']);
const mexicanFoods = new Set(['tortillas', 'tomatoes', 'garlic', 'avocado']);
italianFoods.intersection(mexicanFoods);     // Set { 'garlic', 'tomatoes' }
italianFoods.union(mexicanFoods);            // all, no duplicates
italianFoods.symmetricDifference(mexicanFoods); // in one but not both
italianFoods.isDisjointFrom(new Set(['sushi'])); // true
```

::: tip When to use
Permission checks, comparing selected filters with available ones, "what changed?" diffs between two lists of IDs, common tags between items.
:::

## Maps: Fundamentals

> A `Map` stores key-value pairs where keys can be **any type** (objects, functions, numbers), keeps insertion order and has a `size`.

```js
const rest = new Map();
rest
  .set('name', 'Classico Italiano')
  .set(1, 'Firenze, Italy')
  .set('open', 11)
  .set('close', 23)
  .set(true, 'We are open :D')
  .set(false, 'We are closed :(');

const time = 21;
rest.get(time > rest.get('open') && time < rest.get('close'));   // 'We are open :D'

rest.has('name');   // true
rest.delete(1);
rest.size;          // 5

// Objects as keys: metadata per DOM element or per request
const clickCounts = new Map();
for (const btn of buttons) clickCounts.set(btn, 0);
btn.addEventListener('click', (e) => clickCounts.set(e.currentTarget, clickCounts.get(e.currentTarget) + 1));
```

::: warning Gotcha
Keys are compared by reference: `map.set([1, 2], 'x'); map.get([1, 2])` is `undefined`, because it's a different array. Store the key in a variable.
:::

## Maps: Iteration

> Maps are iterable as `[key, value]` pairs. Create them from arrays of entries or from objects with `Object.entries`.

```js
const question = new Map([
  ['question', 'Best framework?'],
  [1, 'React'],
  [2, 'Vue'],
  [3, 'Svelte'],
  ['correct', 2]
]);

for (const [key, value] of question) {
  if (typeof key === 'number') console.log(`Option ${key}: ${value}`);
}

const hoursMap = new Map(Object.entries(openingHours));  // object → map
const obj = Object.fromEntries(hoursMap);                // map → object
const keys = [...question.keys()];
const values = [...question.values()];

// Counting occurrences
const wordCount = new Map();
for (const w of text.toLowerCase().split(/\W+/)) {
  wordCount.set(w, (wordCount.get(w) ?? 0) + 1);
}
const top = [...wordCount].sort((a, b) => b[1] - a[1]).slice(0, 5);
```

::: tip When to use
Frequency counts, caches keyed by ID, ordered key-value data you add/remove often, and any lookup with non-string keys.
:::

## Summary: Which Data Structure to Use?

> Arrays for ordered lists, Sets for unique values, objects for fixed-shape records, Maps for dynamic key-value lookups.

| Need | Use |
| --- | --- |
| Ordered list, duplicates allowed, need index / array methods | **Array** |
| Unique values, fast `has`, set math | **Set** |
| Fixed-shape record, JSON, methods with `this` | **Object** |
| Dynamic keys, any key type, frequent add/remove, need `size`, ordered iteration | **Map** |
| Key-value attached to objects without leaking memory | **WeakMap** ([details](/behind-the-scenes/memory#weakmap-and-weakref)) |

**Sources of data:** in the program itself (status lists), from the UI (form inputs, DOM), or from external sources (APIs, usually JSON → arrays of objects).

::: tip When to use
Data comes from APIs as arrays of objects. Convert to a Map keyed by ID (`new Map(users.map((u) => [u.id, u]))`) when you need repeated lookups.
:::
