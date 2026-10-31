# Modern Operators

Short-circuiting, nullish coalescing, logical assignment and optional chaining: the operators that replaced most defensive `if` blocks.

## Short-Circuiting (&& and ||)

> `||` returns the first **truthy** operand (or the last one); `&&` returns the first **falsy** operand (or the last one). Evaluation stops as soon as the result is known.

```js
// || for defaults
const displayName = user.nickname || user.firstName || 'Guest';

// && to run something only if the left side is truthy
isDebug && console.log('state', state);
user && user.onLogin && user.onLogin();     // (today: user?.onLogin?.())

// Conditional rendering in JSX / templates
// {error && <p className="error">{error}</p>}

3 || 'x';        // 3
'' || 'x';       // 'x'
0 && 'x';        // 0
'a' && 'b';      // 'b'
```

::: warning Gotcha
`||` treats `0`, `''` and `false` as "missing". `quantity || 1` turns a real `0` into `1`. Use `??` for defaults when those are valid values. In JSX, `{items.length && <List />}` renders a literal `0`.
:::

::: tip When to use
`&&` for guarded calls and conditional rendering; `||` for defaults only when every falsy value really means "no value".
:::

## The Nullish Coalescing Operator (??)

> `a ?? b` returns `b` only when `a` is `null` or `undefined`. `0`, `''` and `false` are kept.

```js
const volume = settings.volume ?? 50;           // 0 stays 0
const pageSize = Number(params.get('size')) || 20; // NaN/0 → 20 (here || is intended)
const label = product.subtitle ?? '';           // '' stays ''
const showTips = prefs.showTips ?? true;        // false stays false

// Combined with optional chaining
const city = user?.address?.city ?? 'Unknown';
```

::: tip When to use
Defaults for numbers, booleans and strings where `0`, `false` or `''` are legitimate values: settings, counters, toggles, API fields.
:::

## Logical Assignment Operators

> `||=`, `&&=` and `??=` combine a logical check with assignment: they only assign when the condition calls for it.

```js
const config = { retries: 0, timeout: undefined, token: 'abc' };

config.timeout ??= 5000;      // assign only if null/undefined → 5000
config.retries ||= 3;         // assign if falsy → 3 (0 is replaced!)
config.retries ??= 3;         // would keep 0
config.token &&= `Bearer ${config.token}`;  // transform only if present

// Lazy initialization of caches / groups
const groups = {};
for (const order of orders) {
  (groups[order.status] ??= []).push(order);
}

// Anonymize only existing fields
user.email &&= '<redacted>';
```

::: tip When to use
Filling in missing options, lazy-initializing nested caches/arrays, and conditionally transforming a value in place.
:::

## Optional Chaining (?.)

> `a?.b` returns `undefined` instead of throwing when `a` is `null`/`undefined`. Also works for calls `fn?.()` and brackets `obj?.[key]`.

```js
// Deeply nested API data
const street = order?.customer?.address?.street;
const firstTag = post.tags?.[0];
const openTime = restaurant.openingHours?.[day]?.open ?? 'closed';

// Optional callbacks
function upload(file, { onProgress } = {}) {
  onProgress?.(0.5);
}

// Optional methods on objects
user.preferences?.save?.();
const count = response.items?.length ?? 0;

// DOM elements that may not exist on every page
document.querySelector('.cookie-banner')?.remove();
```

::: warning Gotcha
Don't sprinkle `?.` everywhere. If a value **must** exist, a crash is better than silently propagating `undefined`. Use it where absence is a real, expected case.
:::

::: tip When to use
Optional API fields, partial data while loading, optional callbacks and plugins, elements that only exist on some pages.
:::
