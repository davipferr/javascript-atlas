# Data Types

JavaScript is dynamically typed: values have types, variables don't.

## Primitive Types

> There are 7 primitives: `number`, `string`, `boolean`, `undefined`, `null`, `symbol` and `bigint`. Everything else is an object.

```js
const price = 19.99;              // number (integers and floats are the same type)
const sku = 'TSHIRT-RED-M';       // string
const inStock = true;             // boolean
let discountCode;                 // undefined: declared, no value yet
const coupon = null;              // null: intentionally "no value"
const id = Symbol('id');          // symbol: unique, used as hidden object keys
const viewsAllTime = 9007199254740993n; // bigint: integers past Number.MAX_SAFE_INTEGER

// Objects: everything else
const product = { sku, price };   // object
const tags = ['cotton', 'summer'];// array (an object)
const fmt = (n) => `$${n}`;       // function (a callable object)
```

**Dynamic typing:** the same variable can hold a number now and a string later. That flexibility is why runtime checks (and TypeScript) matter in larger apps.

::: tip When to use
Know which category a value falls into: **primitives are copied by value, objects by reference** (see [Memory, References & Copies](/behind-the-scenes/memory)). That single fact explains most "why did my state change?" bugs.
:::

## The typeof Operator

> `typeof value` returns the type as a string. It has a few historical quirks you must remember.

```js
typeof 42;            // 'number'
typeof NaN;           // 'number' (!)
typeof 'hi';          // 'string'
typeof undefined;     // 'undefined'
typeof null;          // 'object'  ← famous bug from 1995, never fixed
typeof [];            // 'object'
typeof {};            // 'object'
typeof (() => {});    // 'function'
typeof 10n;           // 'bigint'

// Reliable checks
Array.isArray(tags);                  // arrays
value === null;                       // null
typeof value === 'object' && value !== null; // "real" object
Number.isNaN(value);                  // NaN
```

::: tip When to use
Guarding function inputs (`typeof callback === 'function'`), checking optional globals (`typeof window !== 'undefined'` for code shared between browser and Node/SSR).
:::

## undefined vs null

> `undefined` means "not set yet" (the engine's default). `null` means "deliberately empty" (a value you assign).

```js
let selectedUser;                 // undefined
const user = { name: 'Ana' };
user.phone;                       // undefined: property doesn't exist
function greet(name) { return name; }
greet();                          // undefined: missing argument

// null is a choice you make
let activeModal = null;           // no modal open
function closeModal() { activeModal = null; }

// JSON keeps null but drops undefined
JSON.stringify({ a: undefined, b: null }); // '{"b":null}'

undefined == null;   // true  (loose)
undefined === null;  // false (strict)
```

::: tip When to use
Use `null` to explicitly reset state ("no selection", "logged out") and when an API field must be present but empty. Check for both at once with `value == null` or `value ?? fallback`.
:::

## Symbols <Badge type="tip" text="extra" />

> `Symbol()` creates a guaranteed-unique value, mostly used as object keys that never collide with other keys.

```js
const INTERNAL = Symbol('internal');
const widget = { name: 'chart', [INTERNAL]: { renderCount: 0 } };

Object.keys(widget);        // ['name']: symbols are skipped
JSON.stringify(widget);     // '{"name":"chart"}'

// Well-known symbols let you hook into the language
class Range {
  constructor(from, to) { this.from = from; this.to = to; }
  *[Symbol.iterator]() { for (let i = this.from; i <= this.to; i++) yield i; }
}
[...new Range(1, 4)];       // [1, 2, 3, 4]
```

::: tip When to use
Library authors attaching metadata to user objects without clashing, and making your own classes iterable with `Symbol.iterator`.
:::
