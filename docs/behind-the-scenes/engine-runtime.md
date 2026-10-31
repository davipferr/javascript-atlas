# Engine, Runtime & Call Stack

What JavaScript actually is, where it runs, and how code gets executed.

## A High-Level Overview of JavaScript

> JavaScript is a high-level, garbage-collected, JIT-compiled, multi-paradigm, prototype-based, first-class-function, dynamic, single-threaded language with a non-blocking event loop.

| Trait | What it means in practice |
| --- | --- |
| High-level | No manual memory management |
| Garbage-collected | Unreachable objects are freed automatically |
| JIT-compiled | Compiled to machine code at runtime, then re-optimized while running |
| Multi-paradigm | Procedural, OOP and functional styles all work |
| Prototype-based | Objects inherit from other objects via the prototype chain |
| First-class functions | Functions are values: callbacks, closures, HOFs |
| Dynamic | Types belong to values and are checked at runtime |
| Single-threaded | One call stack: one thing at a time on the main thread |
| Non-blocking event loop | Long tasks (network, timers) run in the background and call back later |

::: tip When to use
"Single-threaded + event loop" explains why a heavy `for` loop freezes the UI, and why you move work to async APIs or Web Workers.
:::

## The JavaScript Engine

> The engine (V8 in Chrome/Node/Deno, SpiderMonkey in Firefox, JavaScriptCore in Safari) has a **call stack** where code runs and a **heap** where objects live.

**Just-in-time compilation pipeline**
1. **Parse** source into an AST (Abstract Syntax Tree). Syntax errors are found here.
2. **Compile** the AST to bytecode / unoptimized machine code and run it right away.
3. **Optimize** hot functions in the background based on observed types; **de-optimize** if assumptions break.

```js
// Engines love stable "shapes". Same properties, same order, same types:
function Point(x, y) { this.x = x; this.y = y; }  // ✅ predictable shape, fast property access

const p = {};
p.x = 1; p.y = 2;           // fine
p.label = 'A';              // adding props later changes the hidden class
delete p.x;                 // ❌ delete can push objects to a slower "dictionary" mode
```

::: tip When to use
Hot paths (rendering loops, large data processing): keep object shapes consistent and functions monomorphic (always the same argument types).
:::

## The JavaScript Runtime

> The runtime is the engine **plus** host APIs plus the callback queue and the event loop. The browser and Node.js are different runtimes.

| Browser runtime | Node.js runtime |
| --- | --- |
| Engine (V8 / SpiderMonkey / JSC) | Engine (V8) |
| Web APIs: DOM, `fetch`, timers, `localStorage`, Geolocation | C++ bindings + libuv: file system, network, processes |
| Callback queue + microtask queue | Same idea, plus `process.nextTick` |
| Event loop | Event loop (with phases) |

```js
// Not part of JavaScript itself: these are provided by the host
document.querySelector('h1');    // browser only
setTimeout(fn, 100);             // browser and Node (different implementations)
require('node:fs');              // Node only

// Universal check for the global object
globalThis === window;           // true in browsers
```

::: tip When to use
Code shared between browser and server (SSR, Next.js, Nuxt) must avoid touching `window`/`document` at import time. Guard with `typeof window !== 'undefined'` or run it inside lifecycle hooks.
:::

## Execution Contexts and the Call Stack

> Each function call creates an **execution context** (variables, scope chain, `this`) that is pushed onto the **call stack**. When the function returns, its context is popped.

```js
const name = 'Ana';                         // global execution context

const first = () => {
  let a = 1;
  const b = second(7, 9);                   // second's context pushed on top
  a = a + b;
  return a;
};

function second(x, y) {
  return x + y;                             // returns → popped
}

const x = first();
// Stack over time: [global] → [global, first] → [global, first, second] → [global, first] → [global]
```

**Each execution context contains**
- The variable environment (`let`/`const`/`var`, function declarations, `arguments` for regular functions).
- The scope chain (references to outer variable environments).
- The `this` binding (arrow functions don't get their own).

```js
// Stack overflow: recursion without a base case
function walk(node) { walk(node.parent); }  // RangeError: Maximum call stack size exceeded
```

::: tip When to use
Reading stack traces in DevTools: the top frame is where the error happened, and every frame below is a caller. The "Call Stack" panel at a breakpoint is this exact structure.
:::
