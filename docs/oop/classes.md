# Classes

ES6 class syntax, accessors, static members, `Object.create`, true privacy and chainable APIs.

## ES6 Classes

> `class` is cleaner syntax over constructor functions and prototypes. The `constructor` sets instance properties; methods go on the prototype automatically.

```js
class Account {
  constructor(owner, currency, locale = navigator.language) {
    this.owner = owner;
    this.currency = currency;
    this.locale = locale;
    this.movements = [];
  }

  // Added to Account.prototype
  deposit(amount) { this.movements.push(amount); }
  withdraw(amount) { this.deposit(-amount); }
  get balance() { return this.movements.reduce((a, b) => a + b, 0); }
}

const acc = new Account('Ana', 'EUR');
acc.deposit(250);
typeof Account;                                       // 'function'
Object.getPrototypeOf(acc) === Account.prototype;     // true
```

**Rules**
- Classes are **not hoisted** (TDZ like `let`).
- Classes are first-class values: pass them, return them, store them.
- Class bodies always run in **strict mode**.

::: tip When to use
Anything with many instances that share behavior: API clients, UI components, domain models (`Cart`, `Invoice`, `Subscription`), custom errors.
:::

## Setters and Getters

> `get prop()` runs when the property is read; `set prop(v)` runs when it's assigned. They look like regular properties from outside.

```js
class User {
  constructor(fullName, email) {
    this.fullName = fullName;     // goes through the setter
    this.email = email;
  }

  get fullName() { return this._fullName; }
  set fullName(name) {
    if (!name.includes(' ')) throw new Error(`${name} is not a full name`);
    this._fullName = name.trim();
  }

  get initials() {
    return this._fullName.split(' ').map((n) => n[0]).join('').toUpperCase();
  }

  set email(v) { this._email = v.trim().toLowerCase(); }
  get email() { return this._email; }
}

const u = new User('Ana Silva', ' Ana@X.com ');
u.initials;     // 'AS' (computed, no parentheses)
u.email;        // 'ana@x.com' (normalized)

// Also in object literals
const cart = { items: [], get count() { return this.items.length; } };
```

::: tip When to use
Derived values (`fullName`, `total`, `isEmpty`), validation and normalization on assignment, and keeping a property API stable while changing the internals.
:::

## Static Methods and Properties

> `static` members live on the class itself, not on instances. Call them as `ClassName.method()`.

```js
class Money {
  static #rates = { EUR: 1, USD: 1.08 };
  static DEFAULT_CURRENCY = 'EUR';

  static from(cents, currency = Money.DEFAULT_CURRENCY) { return new Money(cents, currency); }
  static convert(cents, from, to) { return Math.round((cents / Money.#rates[from]) * Money.#rates[to]); }

  constructor(cents, currency) { this.cents = cents; this.currency = currency; }
}

const price = Money.from(1999);
Money.convert(1999, 'EUR', 'USD');

// Built-in examples
Array.from(nodeList);
Number.parseFloat('2.5');
Object.groupBy(items, fn);
Promise.all(promises);
```

::: tip When to use
Factory methods (`User.fromJSON`), helpers related to the class but not to one instance, constants and shared caches/registries.
:::

## Object.create

> `Object.create(proto)` creates a new object whose prototype is `proto`. No constructor, no `new`, no `prototype` property involved.

```js
const PersonProto = {
  calcAge() { return 2026 - this.birthYear; },
  init(firstName, birthYear) {
    this.firstName = firstName;
    this.birthYear = birthYear;
    return this;
  }
};

const steven = Object.create(PersonProto).init('Steven', 2002);
steven.calcAge();                                  // 24
Object.getPrototypeOf(steven) === PersonProto;     // true

// Dictionary with no inherited keys (no 'toString', '__proto__' surprises)
const counts = Object.create(null);
counts['constructor'] = 1;                         // safe
```

::: tip When to use
Rare in app code. Useful for prototype-based inheritance without classes, and `Object.create(null)` for pure dictionaries (or just use a `Map`).
:::

## Encapsulation: Private Class Fields and Methods

> Prefix fields and methods with `#` to make them truly private: inaccessible outside the class body. Public fields can be declared at the top of the class.

```js
class BankAccount {
  // Public fields (on every instance)
  locale = navigator.language;
  bank = 'Bankist';

  // Private fields
  #movements = [];
  #pin;

  constructor(owner, currency, pin) {
    this.owner = owner;
    this.currency = currency;
    this.#pin = pin;
  }

  // Public API
  getMovements() { return [...this.#movements]; }   // return a copy, not the internal array
  deposit(val) { this.#movements.push(val); return this; }
  requestLoan(val) {
    if (this.#approveLoan(val)) this.deposit(val);
    return this;
  }

  // Private method
  #approveLoan(val) { return val <= 10_000; }

  static #count = 0;
  static create(...args) { BankAccount.#count++; return new BankAccount(...args); }
}

const acc = new BankAccount('Ana', 'EUR', 1111);
// acc.#movements;            // ❌ SyntaxError
// acc.#approveLoan(100);     // ❌ SyntaxError
```

**Before `#`:** the convention was a leading underscore (`_movements`). It signals "internal" but doesn't protect anything.

::: tip When to use
Internal state that must stay consistent (balances, caches, tokens, DOM references in components). Expose a small public API and return copies of internal collections.
:::

## Chaining Methods

> Return `this` from methods that mutate the object, so calls can be chained like jQuery or query builders.

```js
acc.deposit(300).deposit(500).withdraw(35).requestLoan(25000).withdraw(4000);

// Fluent builder
class QueryBuilder {
  #parts = { where: [], limit: null, orderBy: null };
  where(clause) { this.#parts.where.push(clause); return this; }
  orderBy(col, dir = 'asc') { this.#parts.orderBy = `${col} ${dir}`; return this; }
  limit(n) { this.#parts.limit = n; return this; }
  toString() {
    const { where, orderBy, limit } = this.#parts;
    return [
      where.length && `WHERE ${where.join(' AND ')}`,
      orderBy && `ORDER BY ${orderBy}`,
      limit && `LIMIT ${limit}`
    ].filter(Boolean).join(' ');
  }
}
`${new QueryBuilder().where('active = 1').orderBy('created_at', 'desc').limit(20)}`;
```

::: tip When to use
Builders (queries, requests, test fixtures), configuration APIs, and small DSLs. Methods that return a value (getters, `toString`) end the chain.
:::

## ES6 Classes Summary

> One annotated class showing every piece of class syntax.

```js
class Student extends Person {            // inheritance (sets up the prototype chain)
  university = 'University of Lisbon';    // public field (per instance)
  #studyHours = 0;                        // private field
  #course;                                // private field, set in constructor
  static numSubjects = 10;                // static public field

  constructor(fullName, birthYear, startYear, course) {
    super(fullName, birthYear);           // must call parent constructor before using this
    this.startYear = startYear;           // instance property
    this.#course = course;
  }

  introduce() {                           // public method (on prototype)
    return `I study ${this.#course} at ${this.university}`;
  }
  study(h) {
    this.#makeCoffee();
    this.#studyHours += h;
    return this;                          // chainable
  }
  #makeCoffee() { return 'Here is a coffee for you ☕'; }   // private method

  get testScore() { return this._testScore; }               // getter
  set testScore(score) { this._testScore = score <= 20 ? score : 0; }  // setter

  static printCurriculum() { return `${Student.numSubjects} subjects`; }  // static method
}
```
