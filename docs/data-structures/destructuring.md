# Destructuring

Unpacking values from arrays and objects into variables in a single statement.

## Destructuring Arrays

> `const [a, b] = array` assigns by **position**. You can skip items, set defaults and swap variables.

```js
const [first, second] = ['Ana', 'Bia', 'Carla'];       // 'Ana', 'Bia'
const [, , third] = ['Ana', 'Bia', 'Carla'];            // skip with commas

// Defaults for missing positions
const [lat = 0, lng = 0] = coordsString.split(',').map(Number);

// Swap without a temp variable
let main = 'pizza', secondary = 'pasta';
[main, secondary] = [secondary, main];

// Functions returning multiple values
const useToggle = (initial) => {
  let on = initial;
  return [() => on, () => (on = !on)];
};
const [isOn, toggle] = useToggle(false);    // React's useState uses this exact pattern

// Nested
const [x, [y, z]] = [1, [2, 3]];

// Regex matches and split results
const [, year, month] = '2026-10-30'.match(/(\d{4})-(\d{2})/);
```

::: tip When to use
Tuples returned from functions (`useState`, `Promise.all` results, `Object.entries` pairs), parsing split strings, swapping.
:::

## Destructuring Objects

> `const { a, b } = object` assigns by **property name**. Rename with `:`, add defaults with `=`, and go as deep as you need.

```js
const res = {
  data: { user: { id: 7, name: 'Ana', email: 'ana@x.com' }, permissions: ['read'] },
  meta: { page: 1 }
};

const { data, meta } = res;
const { user: { name, email }, permissions = [] } = data;   // nested + default
const { page: currentPage = 1 } = meta;                    // rename + default

// Pick what you need from big objects
const { innerWidth: width, innerHeight: height } = window;

// Mutating existing variables needs parentheses
let a, b;
({ a, b } = { a: 1, b: 2 });

// Loop over entries
for (const [key, { open, close }] of Object.entries(openingHours)) {
  console.log(`${key}: ${open}–${close}`);
}
```

::: tip When to use
Reading API responses, props in components (`function Card({ title, price })`), config objects, imported module members.
:::

## Destructuring Function Parameters

> Destructure an options object directly in the parameter list. Callers pass named options in any order, with defaults applied per field.

```js
function orderDelivery({ starterIndex = 1, mainIndex = 0, time = '20:00', address }) {
  console.log(`Order ${starterIndex}/${mainIndex} delivered to ${address} at ${time}`);
}
orderDelivery({ address: 'Rua Augusta 21', mainIndex: 2 });

// Default the whole object so calling with no args works
function createChart(el, { type = 'line', height = 300, legend = true } = {}) { /* ... */ }
createChart(canvas);

// Callbacks destructuring events and items
input.addEventListener('input', ({ target: { value } }) => search(value));
users.map(({ id, name }) => `<option value="${id}">${name}</option>`);
```

::: tip When to use
Any function with more than two parameters or optional ones. Named options are self-documenting and safe to extend.
:::
