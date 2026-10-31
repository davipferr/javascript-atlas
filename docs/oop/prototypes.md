# Prototypes

How OOP actually works in JavaScript: objects delegating to other objects through the prototype chain.

## OOP in JavaScript

> JavaScript has no "real" classes. Objects are linked to a **prototype** object and **delegate** to it: methods live once on the prototype and every linked object can use them.

| Classical OOP (C#, Java) | JavaScript |
| --- | --- |
| Class is a blueprint; instances are copies of it | Objects link to a prototype object |
| Inheritance copies behavior down | Behavior is **delegated** up the chain |
| Methods belong to the class | Methods live on the prototype object |

**Three ways to create prototype-linked objects**
1. **Constructor functions** + `new` (how built-ins like `Array` and `Date` work).
2. **ES6 classes**: modern syntax over the same constructor/prototype mechanics.
3. **`Object.create(proto)`**: link an object to a prototype directly.

**Four principles** apply the same way: abstraction (hide details), encapsulation (private state), inheritance (reuse logic), polymorphism (override behavior).

::: tip When to use
Knowing it's all prototypes explains `this`, why methods are shared, how `class` and `extends` work, and what you see when you expand `[[Prototype]]` in DevTools.
:::

## Constructor Functions and the new Operator

> A regular function called with `new` builds an object. `new` creates an empty object, sets `this` to it, links it to `Fn.prototype`, and returns it.

```js
const Person = function (firstName, birthYear) {
  // Instance properties
  this.firstName = firstName;
  this.birthYear = birthYear;
  // ❌ Never define methods here: each instance would get its own copy
};

const ana = new Person('Ana', 1991);
// 1. {} is created
// 2. Person is called with this = {}
// 3. {} is linked to Person.prototype
// 4. the object is returned automatically

ana instanceof Person;   // true

// Static-like helper on the constructor itself (not inherited by instances)
Person.hey = function () { return 'Hey there 👋'; };
```

::: tip When to use
You'll read this in older codebases and libraries. For new code, [ES6 classes](/oop/classes) are the same mechanism with clearer syntax.
:::

## Prototypes

> Every function has a `prototype` property. Objects created with `new Fn()` are linked to it (`Object.getPrototypeOf(obj)`), so methods added there are shared by all instances.

```js
Person.prototype.calcAge = function () {
  return 2026 - this.birthYear;
};

ana.calcAge();                                       // 35: found on the prototype
Object.getPrototypeOf(ana) === Person.prototype;     // true
ana.__proto__ === Person.prototype;                  // true (legacy accessor)
Person.prototype.isPrototypeOf(ana);                 // true

// Shared property for all instances
Person.prototype.species = 'Homo Sapiens';
ana.species;                       // inherited
Object.hasOwn(ana, 'firstName');   // true
Object.hasOwn(ana, 'species');     // false
```

::: warning Naming trap
`Person.prototype` is **not** the prototype of `Person`. It's the prototype that will be used for objects **created by** `Person`.
:::

## The Prototype Chain

> When a property isn't found on an object, the engine looks at its prototype, then that prototype's prototype, up to `Object.prototype`, whose prototype is `null`.

```js
ana.hasOwnProperty('firstName');
// ana → Person.prototype → Object.prototype (has hasOwnProperty) → null

Object.getPrototypeOf(Person.prototype) === Object.prototype;  // true
Object.getPrototypeOf(Object.prototype);                       // null

// Same chain for built-ins
const arr = [3, 6, 4];
Object.getPrototypeOf(arr) === Array.prototype;   // map, filter... live here
const h1 = document.querySelector('h1');
// h1 → HTMLHeadingElement → HTMLElement → Element → Node → EventTarget → Object
console.dir(h1);   // expand [[Prototype]] to walk the chain
```

::: tip When to use
Debugging "where does this method come from?", understanding why `instanceof` works, and why shadowing a prototype method on an instance overrides it only for that instance.
:::

## Prototypal Inheritance on Built-In Objects

> Built-ins like `Array`, `String` and `Function` work the same way, so you *can* add methods to their prototypes, but you shouldn't in app code.

```js
Array.prototype.unique = function () { return [...new Set(this)]; };
[1, 1, 2].unique();   // [1, 2]: works, but...
```

::: warning Don't extend built-ins
A future version of JavaScript may add a method with the same name but different behavior (this happened with `Array.prototype.flatten` → renamed to `flat` because of MooTools), and multiple libraries can clash. Write a helper function instead: `const unique = (arr) => [...new Set(arr)]`.
:::

::: tip When to use
Polyfills are the one legitimate case: adding a **standard** method to old browsers that don't have it, exactly as specified.
:::
