# Higher-Order Functions

Functions are values in JavaScript, so they can be passed in, returned, and have their `this` set explicitly.

## First-Class and Higher-Order Functions

> **First-class functions** means functions are values (stored, passed, returned). A **higher-order function** is one that receives or returns another function.

```js
// Stored in variables and objects
const handlers = { save: saveDoc, delete: deleteDoc };

// Passed as arguments: addEventListener, map, setTimeout are all higher-order
btn.addEventListener('click', handlers.save);

// Functions are objects: they have properties and methods
saveDoc.name;       // 'saveDoc'
saveDoc.length;     // number of declared parameters
```

::: tip When to use
This is a language trait, not a feature you opt into. It is what makes callbacks, middleware, event handlers and array methods possible.
:::

## Functions Accepting Callbacks

> Pass a function in so the caller decides **what** happens while your function decides **when/how**. This is abstraction.

```js
// The generic part lives in one place; the specific part is injected
function retry(fn, attempts = 3) {
  return async (...args) => {
    for (let i = 1; i <= attempts; i++) {
      try { return await fn(...args); }
      catch (err) { if (i === attempts) throw err; }
    }
  };
}
const fetchUserSafe = retry(fetchUser);

// Custom sort/format/filter rules
function renderTable(rows, { sortBy = (a, b) => 0, format = (r) => r } = {}) {
  return rows.toSorted(sortBy).map(format);
}
renderTable(users, { sortBy: (a, b) => a.name.localeCompare(b.name) });

// Express-style middleware
app.use((req, res, next) => { console.log(req.method, req.url); next(); });
```

::: tip When to use
Event listeners, array methods, retry/timing wrappers, plugins and middleware, and any time two functions differ only in one step.
:::

## Functions Returning Functions

> A function can build and return another function, pre-configured with arguments it remembers (through closures).

```js
const greet = (greeting) => (name) => `${greeting}, ${name}!`;
const hello = greet('Hello');
hello('Ana');                    // 'Hello, Ana!'

// Pre-configured formatters
const currency = (locale, code) => {
  const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency: code });
  return (n) => fmt.format(n);
};
const brl = currency('pt-BR', 'BRL');
brl(1234.5);                      // 'R$ 1.234,50'

// Factory for API helpers
const createApi = (baseUrl, token) => (path, opts = {}) =>
  fetch(`${baseUrl}${path}`, { ...opts, headers: { Authorization: `Bearer ${token}`, ...opts.headers } });
const api = createApi('https://api.shop.dev', token);
api('/orders');

// Event handler factories
const setFilter = (value) => () => store.setFilter(value);
allBtn.addEventListener('click', setFilter('all'));
```

::: tip When to use
Partial application (preset arguments), factories for formatters/API clients/validators, and handler factories. The returned function keeps its config via [closures](/functions/closures).
:::

## The call and apply Methods

> `fn.call(thisArg, a, b)` and `fn.apply(thisArg, [a, b])` invoke a function with an explicit `this`.

```js
const lufthansa = {
  airline: 'Lufthansa',
  bookings: [],
  book(flightNum, name) {
    this.bookings.push({ flight: `${this.airline} ${flightNum}`, name });
  }
};
const eurowings = { airline: 'Eurowings', bookings: [] };

const book = lufthansa.book;
// book(23, 'Ana');                    // ❌ this is undefined
book.call(eurowings, 23, 'Ana');      // ✅ this = eurowings
book.apply(lufthansa, [239, 'Bia']);  // same, args as array

// Borrowing methods from other objects
Array.prototype.map.call(document.querySelectorAll('li'), (li) => li.textContent);
```

::: tip When to use
Reusing one method across similar objects, borrowing array methods for array-likes. In modern code, `apply` is mostly replaced by spread: `book.call(obj, ...args)`.
:::

## The bind Method

> `fn.bind(thisArg, ...args)` doesn't call the function; it **returns a new one** with `this` (and optionally some arguments) permanently set.

```js
const bookEW = book.bind(eurowings);
bookEW(23, 'Carla');

// Partial application: preset arguments
const bookEW23 = book.bind(eurowings, 23);
bookEW23('Dani');

// Event listeners: this would otherwise be the button
lufthansa.planes = 300;
lufthansa.buyPlane = function () { this.planes++; };
buyBtn.addEventListener('click', lufthansa.buyPlane.bind(lufthansa));

// Passing methods as callbacks
class Gallery {
  constructor(el) {
    this.el = el;
    this.next = this.next.bind(this);          // bind once
    el.querySelector('.next').addEventListener('click', this.next);
  }
  next() { /* uses this.el */ }
}

const addVAT = ((rate, value) => value * (1 + rate)).bind(null, 0.23); // null when this is unused
addVAT(100);   // 123
```

::: tip When to use
Passing an object's method as a callback (event listeners, `setTimeout`, promise `.then`) and presetting arguments. Arrow functions or class field arrows (`next = () => {}`) are the common alternative.
:::
