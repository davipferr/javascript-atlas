# Inheritance

Making one "class" inherit from another, using constructor functions, ES6 classes or `Object.create`.

## Inheritance with ES6 Classes

> `class Child extends Parent` links the prototypes; `super(...)` calls the parent constructor and must run before `this` is used. Methods with the same name **override** the parent's.

```js
class HttpError extends Error {
  constructor(status, message, body) {
    super(message);                 // sets this.message, stack
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
  get isClientError() { return this.status >= 400 && this.status < 500; }
}

class NotFoundError extends HttpError {
  constructor(resource) {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

try {
  throw new NotFoundError('Order #42');
} catch (err) {
  err instanceof NotFoundError;   // true
  err instanceof HttpError;       // true
  err instanceof Error;           // true
  err.isClientError;              // true (inherited getter)
}

// Overriding and calling the parent with super.method()
class Logger {
  log(msg) { console.log(msg); }
}
class TimestampLogger extends Logger {
  log(msg) { super.log(`[${new Date().toISOString()}] ${msg}`); }
}
```

::: tip When to use
Custom error hierarchies (very common and very useful), Web Components (`extends HTMLElement`), and base classes for shared behavior like a base `View` in MVC. Keep hierarchies shallow; prefer composition for everything else.
:::

## Inheritance with Constructor Functions

> Call the parent with `Parent.call(this, ...)` for properties, and link the prototypes with `Object.create(Parent.prototype)` for methods.

```js
const Person = function (firstName, birthYear) {
  this.firstName = firstName;
  this.birthYear = birthYear;
};
Person.prototype.calcAge = function () { return 2026 - this.birthYear; };

const Student = function (firstName, birthYear, course) {
  Person.call(this, firstName, birthYear);   // "super" for properties
  this.course = course;
};

// Link prototypes BEFORE adding methods to Student.prototype
Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;     // repair the constructor pointer

Student.prototype.introduce = function () {
  return `My name is ${this.firstName} and I study ${this.course}`;
};

const mike = new Student('Mike', 2004, 'Computer Science');
mike.calcAge();                 // inherited via the chain
mike instanceof Person;         // true
```

::: tip When to use
Reading and maintaining pre-ES6 code and libraries. It shows exactly what `extends` does for you under the hood.
:::

## Inheritance with Object.create

> Create a child prototype object linked to the parent prototype, and give it an `init` that calls the parent's `init`.

```js
const PersonProto = {
  calcAge() { return 2026 - this.birthYear; },
  init(firstName, birthYear) { this.firstName = firstName; this.birthYear = birthYear; }
};

const StudentProto = Object.create(PersonProto);
StudentProto.init = function (firstName, birthYear, course) {
  PersonProto.init.call(this, firstName, birthYear);
  this.course = course;
};
StudentProto.introduce = function () { return `I study ${this.course}`; };

const jay = Object.create(StudentProto);
jay.init('Jay', 2006, 'Design');
jay.calcAge();
// jay → StudentProto → PersonProto → Object.prototype
```

::: tip When to use
Pure prototypal style without constructors or `new`. It's rare in app code, but it's the clearest demonstration that JS inheritance is just objects linked to objects.
:::

## Polymorphism in Practice

> Subclasses expose the same method names with different behavior, so calling code works with any of them without `if/else` on the type.

```js
class PaymentMethod {
  constructor(amount) { this.amount = amount; }
  fee() { return 0; }
  total() { return this.amount + this.fee(); }
  label() { return 'Payment'; }
}
class CreditCard extends PaymentMethod {
  fee() { return this.amount * 0.029 + 0.3; }
  label() { return 'Credit card'; }
}
class Pix extends PaymentMethod {
  label() { return 'Pix'; }
}
class Boleto extends PaymentMethod {
  fee() { return 3.49; }
  label() { return 'Boleto'; }
}

// Checkout summary doesn't care which subclass it gets
const options = [new CreditCard(100), new Pix(100), new Boleto(100)];
summary.innerHTML = options.map((p) => `<li>${p.label()}: ${p.total().toFixed(2)}</li>`).join('');
```

::: tip When to use
Payment methods, export formats (CSV/PDF/XLSX), notification channels, chart types: anywhere a `switch (type)` keeps growing.
:::

## Composition Over Inheritance <Badge type="tip" text="extra" />

> Instead of deep `extends` chains, build objects from small pieces of behavior (mixins or plain functions) and combine what each one needs.

```js
const withEvents = (Base) => class extends Base {
  #handlers = {};
  on(evt, fn) { (this.#handlers[evt] ??= []).push(fn); return this; }
  emit(evt, data) { this.#handlers[evt]?.forEach((fn) => fn(data)); }
};
const withStorage = (Base) => class extends Base {
  save(key) { localStorage.setItem(key, JSON.stringify(this)); }
};

class Cart {}
class SmartCart extends withStorage(withEvents(Cart)) {}

// Or plain object composition
const createWidget = (el) => ({ el, ...draggable(el), ...resizable(el) });
```

::: tip When to use
When two unrelated classes need the same capability (events, persistence, logging). Deep hierarchies make code rigid; composition keeps pieces independent.
:::
