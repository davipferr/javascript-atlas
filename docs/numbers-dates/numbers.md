# Numbers & Math

Parsing and validating numbers, rounding, the remainder operator, numeric separators and BigInt.

## How Numbers Work

> All JavaScript numbers are 64-bit floating point (IEEE 754). Integers and decimals share one type, and some decimals can't be represented exactly.

```js
23 === 23.0;           // true
0.1 + 0.2;             // 0.30000000000000004
0.1 + 0.2 === 0.3;     // false

// Money: work in cents (integers), format only for display
const priceCents = 1999;
const totalCents = priceCents * 3;                 // 5997
const display = (totalCents / 100).toFixed(2);     // '59.97'

// Compare decimals with a tolerance
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;        // true
```

::: tip When to use
Any financial calculation: store and compute in the smallest unit (cents) or use a decimal library; never sum raw floats for invoices.
:::

## Converting and Checking Numbers

> `Number()` / unary `+` convert strictly; `parseInt`/`parseFloat` read leading digits; `Number.isNaN`, `Number.isFinite` and `Number.isInteger` validate.

```js
Number('23');                 // 23
+'23';                        // 23
Number('23px');               // NaN
Number.parseInt('30px', 10);  // 30 (always pass the radix)
Number.parseFloat('2.5rem');  // 2.5
Number.parseInt('e23', 10);   // NaN: must start with a digit

Number.isNaN(+'abc');         // true
Number.isFinite(20 / 0);      // false (Infinity)
Number.isFinite(+'20');       // true: best check for "is this a real number?"
Number.isInteger(23.0);       // true

// Validate a quantity input
const qty = Number(input.value);
if (!Number.isInteger(qty) || qty < 1) return showError('Enter a whole number ≥ 1');

// Read a CSS value
const gap = Number.parseFloat(getComputedStyle(grid).gap);   // '16px' → 16
```

::: warning Gotcha
Global `isNaN('abc')` coerces first and returns `true`; `Number.isNaN('abc')` returns `false`. Prefer the `Number.*` versions.
:::

::: tip When to use
Validating form fields and query params (`Number.isFinite` is the safest "is numeric" check), and parsing CSS/units with `parseFloat`.
:::

## Math and Rounding

> `Math.round`, `Math.trunc`, `Math.floor` and `Math.ceil` round to integers; `toFixed(n)` rounds to decimals but returns a **string**.

```js
Math.sqrt(25);                 // 5
Math.max(5, 18, '23', 11);     // 23 (coerces)
Math.min(...prices);
Math.PI * Number.parseFloat('10px') ** 2;   // area of a circle

Math.round(23.5);   // 24
Math.trunc(-23.3);  // -23 (removes decimals)
Math.floor(-23.3);  // -24 (rounds down: different from trunc for negatives)
Math.ceil(23.1);    // 24

(2.345).toFixed(2);            // '2.35' (string!)
+(2.345).toFixed(2);           // 2.35

// Random integer between min and max (inclusive)
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
randomInt(10, 20);

// Clamp a value (sliders, zoom, progress)
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const progress = clamp((scrollY / maxScroll) * 100, 0, 100);

// Number of pages
const totalPages = Math.ceil(totalItems / pageSize);
```

::: tip When to use
`ceil` for page counts, `floor` for random indexes and buckets, `clamp` for UI bounds, `toFixed` only for display formatting (or use [Intl](/numbers-dates/dates-intl#internationalizing-numbers-intl)).
:::

## The Remainder Operator

> `a % b` returns what's left after integer division. The classic use is "is even?" and "every Nth".

```js
5 % 2;       // 1
8 % 3;       // 2
const isEven = (n) => n % 2 === 0;

// Zebra-striped rows
rows.forEach((row, i) => row.classList.toggle('row--alt', i % 2 === 0));

// Every 3rd card is a promo slot
items.forEach((item, i) => { if ((i + 1) % 3 === 0) renderPromo(); });

// Wrap around in a carousel
const next = (current + 1) % slides.length;
const prev = (current - 1 + slides.length) % slides.length;

// Seconds → mm:ss
const mm = String(Math.trunc(sec / 60)).padStart(2, '0');
const ss = String(sec % 60).padStart(2, '0');
```

::: tip When to use
Parity checks, striped/alternating layouts, cycling through slides or colors, time conversions.
:::

## Numeric Separators

> Underscores in numeric literals (`1_000_000`) are ignored by the engine and make big numbers readable.

```js
const diameterOfSun = 1_392_700_000;
const priceCents = 345_99;
const MAX_FILE_BYTES = 25 * 1_024 * 1_024;
const TIMEOUT_MS = 30_000;

Number('230_000');   // NaN: only works in code, not when parsing strings
```

::: tip When to use
Constants in code: byte limits, timeouts, prices in cents, large IDs. Never in strings you parse.
:::

## BigInt

> `BigInt` (`123n` or `BigInt(x)`) represents integers of arbitrary size beyond `Number.MAX_SAFE_INTEGER` (2⁵³ − 1).

```js
Number.MAX_SAFE_INTEGER;       // 9007199254740991
2 ** 53 + 1;                   // 9007199254740992 ❌ precision lost

const huge = 4838430248342043823408394839483204n;
huge * 10000n;
// huge * 23;                  // ❌ TypeError: can't mix BigInt and Number
huge * BigInt(23);             // ✅
20n > 15;                      // true (comparisons are fine)
20n === 20;                    // false (different types)
11n / 3n;                      // 3n (integer division)

// Large IDs from APIs (e.g. Twitter/X snowflake IDs) must stay strings or BigInt
const { id_str } = tweet;
const id = BigInt(id_str);
JSON.stringify({ id });        // ❌ TypeError: BigInt can't be serialized
```

::: tip When to use
64-bit IDs from databases/APIs, crypto and blockchain amounts (wei), precise counters. Keep IDs as strings at the JSON boundary.
:::
