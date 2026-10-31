# The this Keyword

`this` is set **when a function is called**, based on how it's called, not where it's written (except for arrows).

## How this Is Determined

> `this` depends on the call site: method call → the object; plain call → `undefined` (strict); arrow → inherited; event listener → the element; `new` → the new instance.

```js
'use strict';
const account = {
  owner: 'Ana',
  greet() { return `Hi ${this.owner}`; }
};

account.greet();                 // method call → this = account → 'Hi Ana'

const greet = account.greet;
greet();                         // plain call → this = undefined → TypeError

btn.addEventListener('click', function () {
  this.classList.add('active');  // listener → this = btn (same as e.currentTarget)
});

function User(name) { this.name = name; }
new User('Ana');                 // new → this = the fresh object

greet.call({ owner: 'Bia' });    // explicit → 'Hi Bia'
```

| How it's called | `this` |
| --- | --- |
| `obj.method()` | `obj` |
| `fn()` (strict / module) | `undefined` |
| `fn()` (sloppy script) | `window` |
| Arrow function | `this` of the enclosing scope |
| `addEventListener` with a regular function | The element the listener is attached to |
| `new Fn()` / class constructor | The new instance |
| `fn.call(x)`, `fn.apply(x)`, `fn.bind(x)` | `x` |

::: tip When to use
Whenever a method "loses" its object (passed as a callback, destructured, used in `setTimeout`), look at **how it's called**. Fix with `bind`, an arrow wrapper, or a class field arrow.
:::

## The this Keyword in Practice

> Method borrowing and extracted methods show that `this` follows the **call**, not the object where the method was defined.

```js
const ana = {
  year: 1991,
  calcAge() { return 2026 - this.year; }
};
const bia = { year: 2001 };
bia.calcAge = ana.calcAge;        // borrow the method
bia.calcAge();                    // 25: this = bia

// Losing this in callbacks
setTimeout(ana.calcAge, 0);                     // ❌ this = undefined/window
setTimeout(() => ana.calcAge(), 0);             // ✅ called as a method
setTimeout(ana.calcAge.bind(ana), 0);           // ✅ bound

// Destructuring methods loses this as well
const { calcAge } = ana;
calcAge();                                      // ❌
```

::: warning Gotcha
React class components, Vue Options API and older libraries all ran into this: `onClick={this.handleClick}` needed `.bind(this)` or an arrow class field.
:::

## Regular Functions vs Arrow Functions

> Arrow functions don't have their own `this` (or `arguments`). They use `this` from the surrounding code, which is great inside methods and wrong **as** methods.

```js
const dashboard = {
  title: 'Sales',
  widgets: ['chart', 'table'],

  // ❌ Arrow as a method: this = outer scope (module → undefined)
  badTitle: () => this?.title,

  // ✅ Regular method, arrow callback inside inherits its this
  render() {
    return this.widgets.map((w) => `${this.title} – ${w}`);
  },

  // Old workaround before arrows
  renderOld() {
    const self = this;
    return this.widgets.map(function (w) { return `${self.title} – ${w}`; });
  }
};

// arguments: regular functions only
function sumAll() { return [...arguments].reduce((a, b) => a + b, 0); }
const sumArrow = (...nums) => nums.reduce((a, b) => a + b, 0);   // use rest params instead
```

| | Regular function | Arrow function |
| --- | --- | --- |
| Own `this` | Yes (depends on call) | No (lexical) |
| `arguments` object | Yes | No (use `...rest`) |
| Can be used with `new` | Yes | No |
| Good as object/class method | ✅ | ❌ (unless class field on purpose) |
| Good as callback inside a method | Needs `bind`/`self` | ✅ |

::: tip When to use
Methods → regular (method shorthand). Callbacks inside methods → arrows. Event listeners that need the element → regular function or use `e.currentTarget` with an arrow.
:::
