# Objects

Key-value structures: creating them, reading properties, methods, modern literal syntax and looping.

## Object Literals

> `{ key: value }` groups related data under named properties. Unlike arrays, order doesn't carry meaning; names do.

```js
const product = {
  id: 'p_381',
  name: 'Running Shoes',
  price: 89.9,
  tags: ['sport', 'outdoor'],
  stock: { warehouse: 12, store: 3 },
  isActive: true
};

product.price = 79.9;        // update
product.discount = 0.1;      // add
delete product.isActive;     // remove

// JSON maps 1:1 to object literals
const body = JSON.stringify(product);
const parsed = JSON.parse(body);
```

::: tip When to use
Any "thing" with named attributes: API payloads, configs, form values, component props. Use arrays for ordered lists of similar items.
:::

## Dot vs Bracket Notation

> `obj.key` for known, valid identifiers. `obj[expression]` when the key is computed, stored in a variable, or not a valid identifier.

```js
product.name;                   // static key
product['name'];                // same

const field = input.name;       // 'email', 'phone', ...
formValues[field] = input.value;// dynamic key: dot notation can't do this

headers['Content-Type'];        // keys with dashes or spaces
translations['pt-BR'];
scores[`round${n}`];            // computed

// Missing property → undefined (not an error)
product.colour;                 // undefined
```

::: tip When to use
Brackets for form handling (`values[e.target.name]`), lookup tables (`statusLabels[status]`), i18n dictionaries and any key coming from data.
:::

## Object Methods

> A function stored as a property is a **method**. Inside it, `this` is the object the method was called on.

```js
const cart = {
  items: [],
  couponPercent: 0,

  add(item) {                   // method shorthand
    this.items.push(item);
    return this;                // enable chaining
  },
  get total() {                 // getter: accessed like a property
    const sum = this.items.reduce((s, i) => s + i.price * i.qty, 0);
    return sum * (1 - this.couponPercent / 100);
  }
};

cart.add({ name: 'Tee', price: 20, qty: 2 }).add({ name: 'Cap', price: 15, qty: 1 });
cart.total;                     // 55
```

::: tip When to use
Small self-contained modules or singletons (a cart, a modal controller, a config with helpers). When you need many instances, use [Classes](/oop/classes).
:::

## Enhanced Object Literals

> ES6 shortcuts: **property shorthand** (`{ name }`), **method shorthand** (`greet() {}`) and **computed keys** (`{ [key]: value }`).

```js
const name = 'Ana';
const role = 'admin';

const user = {
  name,                         // same as name: name
  role,
  greet() { return `Hi ${this.name}`; },   // no "function" keyword
  [`is${role[0].toUpperCase() + role.slice(1)}`]: true   // isAdmin: true
};

// Computed keys in reducers and form handlers
const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

// Building lookup objects
const weekdays = ['mon', 'tue', 'wed'];
const openingHours = {
  [weekdays[0]]: { open: 9, close: 18 },
  [weekdays[2]]: { open: 10, close: 16 }
};
```

::: tip When to use
Always, it's the modern default. Computed keys shine in generic form handlers, state reducers and building objects from config arrays.
:::

## Looping Objects: Keys, Values and Entries

> `Object.keys`, `Object.values` and `Object.entries` turn an object into arrays so you can loop or use array methods. `Object.fromEntries` goes back.

```js
const stock = { shoes: 12, shirts: 0, caps: 5 };

Object.keys(stock);       // ['shoes', 'shirts', 'caps']
Object.values(stock);     // [12, 0, 5]
Object.entries(stock);    // [['shoes', 12], ['shirts', 0], ['caps', 5]]

const totalUnits = Object.values(stock).reduce((a, b) => a + b, 0);
const soldOut = Object.keys(stock).filter((k) => stock[k] === 0);

for (const [item, qty] of Object.entries(stock)) {
  console.log(`${item}: ${qty}`);
}

// Transform an object: entries → map/filter → fromEntries
const inStock = Object.fromEntries(Object.entries(stock).filter(([, qty]) => qty > 0));

// Form → plain object
const data = Object.fromEntries(new FormData(formEl));

// Remove empty query params
const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null));
```

::: tip When to use
Rendering key/value lists (settings, specs tables), totals over dictionary-like data, filtering or mapping objects, and turning `FormData`/`URLSearchParams` into objects.
:::

## Freezing and Checking Properties <Badge type="tip" text="extra" />

> `Object.freeze` makes an object read-only (shallowly); `Object.hasOwn` checks if a property belongs to the object itself.

```js
const ROLES = Object.freeze({ ADMIN: 'admin', EDITOR: 'editor', VIEWER: 'viewer' });
ROLES.ADMIN = 'x';                 // ignored (throws in strict mode)

Object.hasOwn(product, 'price');   // true
'toString' in product;             // true (inherited)
Object.hasOwn(product, 'toString');// false
```

::: tip When to use
`freeze` for enum-like constants and config that must never change at runtime. `hasOwn` when validating payloads or merging objects with unknown keys.
:::
