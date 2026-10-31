# Array Basics

Creating arrays, the mutating basics, simple non-mutating helpers, `at` and `forEach`.

## Introduction to Arrays

> An array is an ordered, zero-indexed list. It can hold any mix of types, and `length` is always the last index + 1.

```js
const friends = ['Ana', 'Bia', 'Carla'];
friends[0];                       // 'Ana'
friends[friends.length - 1];      // 'Carla'
friends[1] = 'Beatriz';           // const arrays are still mutable

const row = ['Ana', 2026 - 1991, 'dev', friends];  // mixed types
const years = new Array(1991, 1984);               // rarely used constructor

// Arrays of objects: the shape of most API data
const orders = [
  { id: 1, total: 120, status: 'paid' },
  { id: 2, total: 45, status: 'pending' }
];
```

::: tip When to use
Ordered collections of similar items: lists of products, rows, messages, steps. If you need fast lookups by key, see [Sets & Maps](/data-structures/sets-maps).
:::

## Basic Mutating Methods

> `push`/`pop` work on the end, `unshift`/`shift` on the start. `indexOf` and `includes` search. These four **mutate** the array.

```js
const queue = ['job1', 'job2'];

queue.push('job3');         // add to end → returns new length
queue.unshift('urgent');    // add to start
queue.pop();                // remove last → returns 'job3'
queue.shift();              // remove first → returns 'urgent'

queue.indexOf('job2');      // 1 (−1 if not found)
queue.includes('job9');     // false (uses ===)

// Stack (undo history) = push + pop
history.push(state);
const previous = history.pop();

// Queue (FIFO) = push + shift
tasks.push(newTask);
const next = tasks.shift();
```

::: tip When to use
Undo stacks, job/notification queues, recent-items lists. In React/Redux state, prefer non-mutating alternatives (`[...arr, x]`, `arr.slice(1)`).
:::

## Simple Array Methods: slice, splice, reverse, concat, join

> `slice` and `concat` return new arrays; `splice` and `reverse` **mutate** the original.

```js
const arr = ['a', 'b', 'c', 'd', 'e'];

arr.slice(2);          // ['c','d','e']
arr.slice(1, 3);       // ['b','c'] (end not included)
arr.slice(-2);         // ['d','e']
arr.slice();           // shallow copy

const page2 = results.slice(20, 40);           // pagination
const top3 = [...scores].sort((a, b) => b - a).slice(0, 3);

arr.splice(-1);        // removes 'e' (mutates); returns removed items
arr.splice(1, 2);      // removes 2 items from index 1
todos.splice(index, 1);                        // delete one item by index
todos.splice(index, 0, newTodo);               // insert at index

arr.reverse();         // mutates!
[1, 2].concat([3, 4]); // [1,2,3,4] (same as [...a, ...b])
['2026', '10', '30'].join('-');                // '2026-10-30'
```

| Method | Mutates? | Returns |
| --- | --- | --- |
| `slice(start, end)` | No | New array |
| `splice(start, deleteCount, ...items)` | **Yes** | Removed items |
| `reverse()` | **Yes** | The same array |
| `concat(...arrays)` | No | New array |
| `join(separator)` | No | String |

::: tip When to use
`slice` for pagination and "first N", `splice` to remove/insert by index in non-reactive code. For immutable versions see [toSpliced / toReversed](/arrays/sorting-creating#non-destructive-alternatives-tosorted-toreversed-tospliced-with).
:::

## The at Method

> `arr.at(i)` reads by index and accepts **negative** indexes counting from the end. Works on strings too.

```js
const prices = [10, 20, 30];
prices.at(0);          // 10
prices.at(-1);         // 30 (vs prices[prices.length - 1])
prices.at(-2);         // 20

const lastMessage = chat.messages.at(-1);
const latestVersion = releases.at(-1)?.tag;
'invoice.pdf'.at(-1);  // 'f'
```

::: tip When to use
Getting the last (or Nth-from-last) element, especially in method chains: `items.filter(isActive).at(-1)`.
:::

## Looping Arrays: forEach

> `arr.forEach((item, index, array) => {...})` runs a callback for each element and returns `undefined`. You **can't** break out of it.

```js
const movements = [200, 450, -400, 3000, -650];

movements.forEach((mov, i) => {
  const type = mov > 0 ? 'deposit' : 'withdrawal';
  container.insertAdjacentHTML(
    'afterbegin',
    `<div class="movement movement--${type}">${i + 1}. ${type} ${mov}€</div>`
  );
});

// Side effects on each element: attach listeners, update DOM
document.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
```

::: warning Gotcha
`forEach` with an `async` callback doesn't wait: all calls start at once and the loop finishes immediately. Use `for...of` with `await` (sequential) or `Promise.all(arr.map(async ...))` (parallel).
:::

::: tip When to use
Side effects for every element (DOM updates, logging, sending events). If you're building a new array, use `map`/`filter`; if you need `break`, use `for...of`.
:::

## forEach With Maps and Sets

> `Map.forEach` gives `(value, key, map)`; `Set.forEach` gives `(value, value, set)` because sets have no keys.

```js
const currencies = new Map([['USD', 'US Dollar'], ['EUR', 'Euro'], ['BRL', 'Real']]);
currencies.forEach((name, code) => {
  select.add(new Option(`${code} – ${name}`, code));
});

const uniqueTags = new Set(['js', 'css', 'js']);
uniqueTags.forEach((tag) => tagList.append(Object.assign(document.createElement('li'), { textContent: tag })));
```

::: tip When to use
Rendering options or lists from a Map/Set. `for...of` with destructuring (`for (const [code, name] of currencies)`) is often clearer.
:::
