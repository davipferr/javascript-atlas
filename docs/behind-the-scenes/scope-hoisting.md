# Scope & Hoisting

Where variables live, how the engine looks them up, and why some can be used before they're declared.

## Scope and the Scope Chain

> JavaScript uses **lexical scoping**: what a function can access depends on where it is **written**, not where it's called. Inner scopes can see outer ones, never the reverse.

```js
const appName = 'Dashboard';                 // global scope

function renderUser(user) {                  // function scope
  const greeting = `Welcome to ${appName}`;  // ✅ looks up the chain to global

  if (user.isAdmin) {                        // block scope
    const badge = 'ADMIN';                   // only inside this block
    var legacy = true;                       // var ignores blocks → function scope
    console.log(greeting, badge);
  }
  // console.log(badge);                     // ❌ ReferenceError
  console.log(legacy);                       // true
}
// console.log(greeting);                    // ❌ not visible outside
```

| Scope | Created by | Holds |
| --- | --- | --- |
| Global | Top level of a script | Everything declared at the top level |
| Module | Each ES module file | Top-level declarations of that module only |
| Function | Every function | Params, `var`, `let`, `const`, inner functions |
| Block | `{ }` in `if`, `for`, `while`, bare blocks | `let`, `const` (and functions in strict mode) |

::: tip When to use
Keep variables in the **smallest scope possible**. It prevents name collisions and makes it obvious which code can change a value.
:::

## Scoping in Practice: Shadowing

> An inner variable with the same name as an outer one **shadows** it: the lookup stops at the first match.

```js
const status = 'idle';

function load() {
  const status = 'loading';     // shadows the global
  if (true) {
    const status = 'done';      // shadows again, only in this block
    console.log(status);        // 'done'
  }
  console.log(status);          // 'loading'
}

// Reassigning (no const/let) changes the outer variable instead
let count = 0;
function inc() { count = count + 1; }   // updates the outer count
```

::: warning Gotcha
Shadowing is legal but makes code hard to follow. Linters (`no-shadow`) flag it. Common accidental case: naming a parameter `event`, `name` or `status`.
:::

## Hoisting

> Before running a scope, the engine scans it and registers declarations. Function declarations become usable early; `var` becomes `undefined`; `let`/`const`/`class` exist but are unusable until their line.

```js
console.log(addDecl(2, 3));   // 5: function declarations are fully hoisted
console.log(me);              // undefined: var is hoisted with undefined
// console.log(job);          // ❌ ReferenceError: Cannot access 'job' before initialization
// addArrow(2, 3);            // ❌ same: const in the TDZ

var me = 'Ana';
let job = 'dev';
function addDecl(a, b) { return a + b; }
const addArrow = (a, b) => a + b;

// Classic var bug
if (!numProducts) deleteShoppingCart();   // runs! numProducts is undefined (falsy)
var numProducts = 10;
```

| | Hoisted? | Initial value | Scope |
| --- | --- | --- | --- |
| `function` declaration | Yes | The function itself | Block (strict) / function |
| `var` | Yes | `undefined` | Function |
| `let` / `const` | Yes, but in the TDZ | Uninitialized | Block |
| Function expression / arrow | Follows its `var`/`let`/`const` | | |
| `class` | Yes, but in the TDZ | Uninitialized | Block |

::: tip When to use
Hoisting of function declarations is what lets you put the main code at the top and helper functions at the bottom of a file. Declare variables at the top of their scope to avoid surprises.
:::

## The Temporal Dead Zone (TDZ)

> The TDZ is the region from the start of a scope until a `let`/`const`/`class` line runs. Accessing the variable there throws instead of silently returning `undefined`.

```js
function getConfig() {
  // ---- TDZ for `env` starts here ----
  console.log(typeof env);   // ❌ ReferenceError (even typeof throws in the TDZ)
  const env = import.meta.env.MODE;
  // ---- TDZ ends ----
  return env;
}

// Real-world trigger: circular imports
// a.js: import { b } from './b.js'; export const a = 1;
// b.js: import { a } from './a.js'; console.log(a); // ReferenceError if b runs first
```

::: tip When to use
A "Cannot access X before initialization" error means TDZ. Look for code that runs before the declaration, often in circular module imports or a callback invoked during setup.
:::
