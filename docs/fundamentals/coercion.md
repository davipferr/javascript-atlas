# Coercion, Truthy & Equality

Converting between types on purpose, the conversions JavaScript does for you, and how to compare safely.

## Type Conversion (Explicit)

> You convert manually with `Number()`, `String()` and `Boolean()`. Inputs from the DOM, URLs and storage are always strings.

```js
const qtyInput = document.querySelector('#qty');
const qty = Number(qtyInput.value);        // '3' → 3, '' → 0, 'abc' → NaN

const page = Number(new URLSearchParams(location.search).get('page')) || 1;

String(404);            // '404'
(404).toString();       // '404'
Boolean('false');       // true! any non-empty string is truthy

// Unary + is a short Number()
const price = +priceInput.value;

// parseInt/parseFloat read a number from the start of a string
Number.parseInt('30px', 10);   // 30
Number.parseFloat('2.5rem');   // 2.5
Number('30px');                // NaN
```

::: tip When to use
Right at the boundary: when reading `input.value`, query params, `localStorage`, `dataset` attributes or CSV data. Convert once, then work with real types.
:::

## Type Coercion (Implicit)

> When an operator gets the "wrong" type, JavaScript converts it automatically. `+` prefers strings; `- * / < >` prefer numbers.

```js
'I am ' + 23 + ' years';  // 'I am 23 years'
'23' - '3';               // 20
'23' * '2';               // 46
'10' / '2';               // 5
'5' > 2;                  // true
true + 1;                 // 2
[] + {};                  // '[object Object]'

let n = '1' + 1;          // '11'
n = n - 1;                // 10

// Template literals coerce to string too
`Items: ${3}`;            // 'Items: 3'
```

::: warning Gotcha
Adding numeric strings from inputs concatenates: `'10' + '5'` is `'105'`. Classic cart-total bug. Convert first.
:::

## Truthy and Falsy Values

> In a boolean context, exactly 8 values are falsy: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` and `NaN`. Everything else is truthy.

```js
// Truthy surprises
Boolean('0');      // true
Boolean(' ');      // true
Boolean([]);       // true  (empty array!)
Boolean({});       // true

if (user) renderProfile(user);          // guards against null/undefined
if (items.length) renderList(items);    // 0 is falsy → skip empty list
if (!searchTerm.trim()) return;         // empty or whitespace-only search

// The trap: valid falsy values
const volume = settings.volume || 50;   // ❌ volume 0 becomes 50
const volume2 = settings.volume ?? 50;  // ✅ only null/undefined fall back
```

::: tip When to use
Quick existence checks (`if (user)`, `if (arr.length)`). When `0`, `''` or `false` are valid values, use `??` or an explicit comparison instead.
:::

## Equality: == vs ===

> `===` (strict) compares value **and** type. `==` (loose) coerces types first and has surprising rules. Default to `===`.

```js
18 === 18;        // true
'18' === 18;      // false
'18' == 18;       // true (string → number)
0 == '';          // true
0 == false;       // true
null == undefined;// true
null == 0;        // false
NaN === NaN;      // false: NaN equals nothing, not even itself

// Objects compare by reference, never by content
{ id: 1 } === { id: 1 };          // false
const a = { id: 1 }, b = a;
a === b;                          // true

// The one accepted use of ==
if (value == null) { /* null OR undefined */ }

// Same-value equality
Object.is(NaN, NaN);  // true
Object.is(0, -0);     // false
```

::: tip When to use
Always `===` / `!==`. The `== null` idiom is the only common exception. To compare objects by content, compare specific fields or `JSON.stringify` simple data.
:::
