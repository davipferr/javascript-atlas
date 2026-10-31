# Clean & Functional JavaScript

Writing readable modern JavaScript, and the declarative/functional principles behind maintainable code.

## Readable Code

> Write code others (and future you) understand without explanations: descriptive names, small functions, DRY, and no clever tricks.

```js
// ❌ Hard to read
const f = (a) => a.filter((x) => x.s === 1 && x.d > Date.now() - 2592e6).length;

// ✅ Names explain intent
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const isActive = (user) => user.status === STATUS.ACTIVE;
const loggedInRecently = (user) => user.lastLogin > Date.now() - THIRTY_DAYS_MS;
const countEngagedUsers = (users) => users.filter((u) => isActive(u) && loggedInRecently(u)).length;
```

**General rules**
- Variables named for **what they contain**, functions for **what they do** (`getUser`, `isValid`, `renderCart`).
- One function, one job. If you need "and" to describe it, split it.
- Avoid magic numbers and strings: name them as constants.
- Don't Repeat Yourself, but don't abstract after the first duplicate either.

::: tip When to use
Always. Readable code is cheaper to change than clever code.
:::

## Modern Language Choices

> Use `const` by default, `===`, arrow callbacks, template literals, destructuring, `?.`/`??`, async/await and ES modules. Avoid `var` and `function` expressions for callbacks.

```js
// ❌ Old style
var self = this;
var total = 0;
for (var i = 0; i < items.length; i++) {
  if (items[i].price != null) total = total + items[i].price;
}
$.get('/api/user', function (data) { self.render(data.user && data.user.name || 'Guest'); });

// ✅ Modern
const total = items.reduce((sum, { price = 0 }) => sum + price, 0);
const { user } = await getJSON('/api/user');
this.render(user?.name ?? 'Guest');
```

::: tip When to use
New code and any file you're already refactoring. Let ESLint + Prettier enforce the boring parts.
:::

## Functions and Control Flow

> Prefer guard clauses over nested `if`s, keep functions small, use default params and options objects, and return values instead of mutating outer state.

```js
// ❌ Arrow pyramid
function checkout(cart, user) {
  if (user) {
    if (cart.length) {
      if (user.address) {
        return placeOrder(cart, user);
      } else { throw new Error('No address'); }
    } else { throw new Error('Empty cart'); }
  } else { throw new Error('Not logged in'); }
}

// ✅ Guard clauses: handle the edge cases first, keep the happy path flat
function checkout(cart, user) {
  if (!user) throw new Error('Not logged in');
  if (!cart.length) throw new Error('Empty cart');
  if (!user.address) throw new Error('No address');
  return placeOrder(cart, user);
}
```

::: tip When to use
Any function with more than one level of nesting. Guard clauses are also the cleanest way to handle `null` inputs and permissions.
:::

## Declarative vs Imperative Code

> **Imperative**: tell the computer *how*, step by step (loops, counters, mutation). **Declarative**: describe *what* you want (`map`, `filter`, `reduce`, destructuring) and let abstractions handle the how.

```js
// Imperative
const doubled = [];
for (let i = 0; i < nums.length; i++) doubled[i] = nums[i] * 2;

// Declarative
const doubled2 = nums.map((n) => n * 2);

// Real case: build the order summary
const summary = cart
  .filter(({ qty }) => qty > 0)
  .map(({ name, qty, price }) => ({ name, qty, line: qty * price }))
  .toSorted((a, b) => b.line - a.line);
```

::: tip When to use
Data transformations, rendering and configuration. Imperative loops still win for complex early exits, async-in-sequence, or performance-critical code.
:::

## Functional Programming Principles

> Build software from **pure functions** (same input → same output, no side effects) and **immutable data** (create new values instead of changing existing ones).

```js
// ❌ Impure: depends on and mutates outside state
let budget = [];
const addExpense = (value, description) => {
  budget.push({ value, description });         // mutation
};

// ✅ Pure: everything it needs comes in, a new value comes out
const addExpensePure = (state, limits, value, description, user = 'jonas') => {
  const cleanUser = user.toLowerCase();
  return value <= (limits[cleanUser] ?? 0)
    ? [...state, { value: -value, description, user: cleanUser }]
    : state;
};

// Freeze to catch accidental mutation (shallow)
const spendingLimits = Object.freeze({ jonas: 1500, matilda: 100 });
const newBudget = addExpensePure(budget, spendingLimits, 10, 'Pizza 🍕');

// Side effects pushed to the edges: pure core, impure shell
const nextState = reducer(state, action);   // pure
render(nextState);                          // side effect
localStorage.setItem('state', JSON.stringify(nextState)); // side effect
```

**Vocabulary**
- **Side effect**: changing anything outside the function (mutating args/globals, DOM, HTTP, logging).
- **Pure function**: no side effects, no dependence on outside state.
- **Immutability**: never change state in place; derive new state.

::: tip When to use
Business logic (pricing, permissions, validation, reducers) as pure functions: trivial to test and reuse. React, Redux, Vue's computed and most state libraries are built on these ideas.
:::

## Composition with pipe <Badge type="tip" text="extra" />

> `pipe(f, g, h)(x)` runs `h(g(f(x)))`, so a data transformation reads left-to-right as a list of small steps.

```js
const pipe = (...fns) => (input) => fns.reduce((acc, fn) => fn(acc), input);

const slugify = pipe(
  (s) => s.trim().toLowerCase(),
  (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, ''),
  (s) => s.replace(/[^a-z0-9]+/g, '-'),
  (s) => s.replace(/^-|-$/g, '')
);
slugify('  Ação & Reação  ');   // 'acao-reacao'

const prepareRows = pipe(removeDuplicates, normalizeDates, sortByDate, paginate(20));
```

::: tip When to use
Data cleaning and transformation pipelines (imports, reports, search normalization) built from small pure functions.
:::
