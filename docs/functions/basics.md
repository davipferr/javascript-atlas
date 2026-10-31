# Function Basics

The three ways to create functions, default parameters, and how arguments are passed.

## Function Declarations

> `function name(params) { ... }` creates a named function that is **hoisted**: you can call it before the line where it's defined.

```js
// Top-level helpers read top-down: main logic first, details below
renderDashboard(user);

function renderDashboard(user) {
  renderHeader(user);
  renderStats(calculateStats(user.orders));
}

function calculateStats(orders) {
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  return { count: orders.length, revenue, avg: revenue / orders.length || 0 };
}
```

::: tip When to use
Named, reusable top-level functions in a module, where hoisting lets you put the "story" at the top and helpers at the bottom.
:::

## Function Expressions

> A function stored in a variable: `const fn = function (params) { ... }`. Not callable before the definition line.

```js
const calcAge = function (birthYear) {
  return new Date().getFullYear() - birthYear;
};

// Functions are values: pass them around or store them in objects
const validators = {
  email: function (v) { return /^\S+@\S+\.\S+$/.test(v); },
  phone: function (v) { return /^\+?\d{9,15}$/.test(v); }
};
validators[field.dataset.type](field.value);

// Named function expressions show a useful name in stack traces and can call themselves
const fact = function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); };
```

| | Declaration | Expression |
| --- | --- | --- |
| Hoisted | Yes, callable before definition | No (TDZ with `const`/`let`) |
| Syntax | Statement | Value assigned to a variable |
| Typical use | Module-level named functions | Callbacks, conditional definitions, object values |

::: tip When to use
When you want definition order enforced, or when the function is a value (callbacks, strategy maps, conditionally chosen implementations).
:::

## Arrow Functions

> `(params) => expression` is a shorter function expression with an **implicit return**. Arrows have no own `this` or `arguments`.

```js
const double = (n) => n * 2;
const fullName = (u) => `${u.first} ${u.last}`;
const toOption = (c) => ({ value: c.code, label: c.name });   // wrap object literals in ()

const total = cart.map((i) => i.price * i.qty).reduce((a, b) => a + b, 0);

// Multi-line body needs braces and an explicit return
const yearsUntilRetirement = (birthYear, name) => {
  const age = 2026 - birthYear;
  const left = 65 - age;
  return left > 0 ? `${name} retires in ${left} years` : `${name} is retired`;
};

// They inherit this from the surrounding scope
class Timer {
  seconds = 0;
  start() {
    setInterval(() => this.seconds++, 1000);   // this = the Timer instance
  }
}
```

::: warning Gotcha
Don't use arrows as **object methods** that need `this`, as event handlers that rely on `this === element`, or as constructors. See [The this Keyword](/behind-the-scenes/this).
:::

::: tip When to use
Callbacks (`map`, `filter`, `then`, `setTimeout`), short pure helpers, and inside methods when you want to keep the outer `this`.
:::

## Functions Calling Other Functions

> Break a task into small, single-purpose functions and compose them. Each function does one thing and can be tested alone.

```js
const cents = (amount) => Math.round(amount * 100);
const applyCoupon = (total, coupon) => (coupon ? total * (1 - coupon.percent / 100) : total);
const addTax = (total, rate) => total * (1 + rate);

function checkoutTotal(cart, coupon, taxRate) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discounted = applyCoupon(subtotal, coupon);
  return cents(addTax(discounted, taxRate)) / 100;
}
```

::: tip When to use
Any time a function grows past one responsibility. Small composable pieces are the foundation of DRY code and of functional patterns like `pipe`.
:::

## Default Parameters

> `function f(a, b = defaultValue)` uses the default when the argument is `undefined`. Defaults can reference earlier parameters.

```js
function createBooking(flightNum, passengers = 1, price = 199 * passengers) {
  return { flightNum, passengers, price };
}
createBooking('LH123');            // passengers 1, price 199
createBooking('LH123', 3);         // price 597
createBooking('LH123', undefined, 50); // skip a param with undefined

// Options object + defaults: the most common real-world pattern
async function fetchJson(url, { method = 'GET', timeout = 8000, headers = {} } = {}) {
  const res = await fetch(url, { method, headers, signal: AbortSignal.timeout(timeout) });
  return res.json();
}
fetchJson('/api/me');
fetchJson('/api/orders', { timeout: 15000 });
```

::: warning Gotcha
`null` does **not** trigger the default; only `undefined` (or a missing argument) does.
:::

::: tip When to use
Optional configuration (`limit = 20`, `locale = navigator.language`), and with a destructured options object for functions with more than 2–3 parameters.
:::

## Passing Arguments: Value vs Reference

> JavaScript always passes by **value**, but for objects that value is a **reference**. Mutating a passed object changes the caller's object; reassigning the parameter doesn't.

```js
function checkIn(flight, passenger) {
  flight = 'LH999';                   // local reassignment: caller unaffected
  passenger.name = 'Mr. ' + passenger.name;  // mutation: caller's object changes!
}

const flightNum = 'LH234';
const jonas = { name: 'Jonas', passport: 2493 };
checkIn(flightNum, jonas);
flightNum;      // 'LH234'
jonas.name;     // 'Mr. Jonas'

// Safer: return a new object instead of mutating the input
const withTitle = (p) => ({ ...p, name: `Mr. ${p.name}` });
```

::: tip When to use
Remember this whenever you pass state into helpers (React/Vue state, Redux, shared config). Prefer functions that **return new objects** over ones that mutate their arguments.
:::
