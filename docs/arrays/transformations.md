# Transforming: map, filter, reduce

The three core data transformations, and how to chain them into pipelines.

## Data Transformations Overview

> `map` transforms every element, `filter` keeps elements that pass a test, `reduce` boils everything down to one value. All three return new values and don't mutate.

| Method | Input → Output | Typical question |
| --- | --- | --- |
| `map` | n items → n items | "Turn each X into Y" |
| `filter` | n items → ≤ n items | "Which X match?" |
| `reduce` | n items → 1 value (number, object, array…) | "What's the total / grouping / lookup?" |

::: tip When to use
Almost every "process the API response before rendering" task is a combination of these three.
:::

## The map Method

> `arr.map((item, i, arr) => newItem)` returns a **new array** of the same length with each element transformed.

```js
const eurToUsd = 1.08;
const movementsUSD = movements.map((mov) => mov * eurToUsd);

// Shape API data for the UI
const options = countries.map(({ code, name }) => ({ value: code, label: name }));

// Render lists
list.innerHTML = products.map((p) => `<li data-id="${p.id}">${p.name}</li>`).join('');

// Computing usernames (side effect on each object: forEach + map)
const createUsernames = (accounts) =>
  accounts.forEach((acc) => {
    acc.username = acc.owner.toLowerCase().split(' ').map((n) => n[0]).join('');  // 'Steven Thomas Williams' → 'stw'
  });

// Using the index
const ranked = players.map((p, i) => ({ ...p, rank: i + 1 }));
```

::: warning Gotcha
`['1', '2', '3'].map(parseInt)` returns `[1, NaN, NaN]` because `map` passes `(item, index)` and `parseInt` treats the index as the radix. Use `.map(Number)` or an arrow.
:::

::: tip When to use
Converting data from one shape to another: API DTO → view model, numbers → formatted strings, objects → HTML strings or components.
:::

## The filter Method

> `arr.filter((item) => condition)` returns a new array with only the elements for which the callback returns truthy.

```js
const deposits = movements.filter((mov) => mov > 0);
const withdrawals = movements.filter((mov) => mov < 0);

// Search + filters in a product list
const results = products.filter((p) =>
  p.name.toLowerCase().includes(query.toLowerCase()) &&
  (!filters.category || p.category === filters.category) &&
  p.price <= filters.maxPrice
);

// Remove one item immutably
const remaining = todos.filter((t) => t.id !== idToDelete);

// Remove falsy values
const cleaned = [0, 'a', '', null, 'b', undefined].filter(Boolean);  // ['a', 'b']
```

::: tip When to use
Search results, filter panels, removing items from state immutably, cleaning invalid rows.
:::

## The reduce Method

> `arr.reduce((acc, item) => newAcc, initialValue)` walks the array carrying an **accumulator**. Always pass the initial value.

```js
const balance = movements.reduce((acc, mov) => acc + mov, 0);

// Maximum
const max = movements.reduce((acc, mov) => (mov > acc ? mov : acc), movements[0]);

// Cart totals in one pass
const { subtotal, items } = cart.reduce(
  (acc, line) => ({ subtotal: acc.subtotal + line.price * line.qty, items: acc.items + line.qty }),
  { subtotal: 0, items: 0 }
);

// Array → lookup object by id
const byId = users.reduce((acc, u) => {
  acc[u.id] = u;
  return acc;
}, {});

// Counting
const statusCount = orders.reduce((acc, o) => {
  acc[o.status] = (acc[o.status] ?? 0) + 1;
  return acc;
}, {});   // { paid: 12, pending: 3, refunded: 1 }
```

::: warning Gotcha
Without an initial value, `reduce` uses the first element and **throws on an empty array**. Always pass the second argument.
:::

::: tip When to use
Totals, averages, min/max, building lookup objects and counts. For grouping prefer [`Object.groupBy`](/arrays/sorting-creating#array-grouping); for simple sums `reduce` is ideal.
:::

## Chaining Methods

> Because `map` and `filter` return arrays, you can chain them into a readable pipeline that ends in `reduce`, `join`, `find`, etc.

```js
const totalDepositsUSD = movements
  .filter((mov) => mov > 0)
  .map((mov) => mov * eurToUsd)
  .reduce((acc, mov) => acc + mov, 0);

// Dashboard KPI: revenue from paid orders this month
const monthlyRevenue = orders
  .filter((o) => o.status === 'paid')
  .filter((o) => isSameMonth(new Date(o.createdAt), new Date()))
  .reduce((sum, o) => sum + o.total, 0);

// Top 5 most expensive in-stock product names
const top5 = products
  .filter((p) => p.stock > 0)
  .toSorted((a, b) => b.price - a.price)
  .slice(0, 5)
  .map((p) => p.name);
```

::: tip When to use
Data pipelines for dashboards, reports and list rendering. Keep chains short and readable. Don't chain mutating methods like `sort`/`splice` on the original data, and don't over-chain huge arrays in hot paths (each step creates a new array).
:::

## flat and flatMap

> `flat(depth)` flattens nested arrays; `flatMap(fn)` is `map` followed by `flat(1)`, in one pass.

```js
const nested = [[1, 2], [3, [4, 5]]];
nested.flat();        // [1, 2, 3, [4, 5]]
nested.flat(2);       // [1, 2, 3, 4, 5]

// All movements across all accounts
const overallBalance = accounts
  .flatMap((acc) => acc.movements)
  .reduce((a, b) => a + b, 0);

// All tags used across posts, unique
const allTags = [...new Set(posts.flatMap((p) => p.tags))];

// Map and filter in one go: return [] to drop, [x] to keep
const validEmails = rows.flatMap((r) => (r.email?.includes('@') ? [r.email.toLowerCase()] : []));
```

::: tip When to use
Combining nested lists from APIs (orders → line items, posts → tags, users → roles) and one-pass map+filter.
:::
