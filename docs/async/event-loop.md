# The Event Loop

How a single-threaded language runs non-blocking async code.

## Asynchronous Behind the Scenes

> Async work (timers, network, DOM events) runs in the **Web APIs** environment, outside the call stack. When it finishes, its callback is queued. The **event loop** moves queued callbacks onto the call stack **only when the stack is empty**.

```js
// The image downloads in the Web APIs environment, not on the call stack
el.src = 'dog.jpg';
el.addEventListener('load', () => el.style.opacity = 1);   // callback registered in Web APIs

fetch('https://api.shop.dev/products')                     // request handled by the browser
  .then((res) => console.log(res));                        // callback goes to the MICROTASK queue
```

**The pieces**
1. **Call stack**: where code runs, one frame at a time.
2. **Web APIs**: timers, fetch, DOM events, geolocation. They run outside the engine.
3. **Callback (task / macrotask) queue**: `setTimeout`, `setInterval`, DOM events, I/O.
4. **Microtask queue**: promise callbacks (`then`/`catch`/`finally`, `await` continuations), `queueMicrotask`, `MutationObserver`.
5. **Event loop**: when the stack is empty, run **all** microtasks, then render if needed, then take **one** task.

::: tip When to use
This model explains why `setTimeout(fn, 0)` doesn't run "now", why long loops freeze clicks and animations, and why promise callbacks beat timers.
:::

## The Event Loop in Practice

> Synchronous code first, then **all** microtasks (promises), then tasks (timers). A timer's delay is a minimum, not a guarantee.

```js
console.log('Test start');                                  // 1
setTimeout(() => console.log('0 sec timer'), 0);            // 5 (task queue)
Promise.resolve('Resolved promise 1').then(console.log);    // 3 (microtask)

Promise.resolve('Resolved promise 2').then((res) => {
  for (let i = 0; i < 1_000_000_000; i++) {}                // blocks for a while...
  console.log(res);                                         // 4
});

console.log('Test end');                                    // 2

// Output: Test start → Test end → Resolved promise 1 → Resolved promise 2 → 0 sec timer
// The "0 sec" timer runs seconds late because the microtask blocked the stack
```

::: warning Gotcha
Microtasks can **starve** the task queue: a promise chain that keeps scheduling more microtasks blocks timers, input events and rendering.
:::

## Keeping the UI Responsive <Badge type="tip" text="extra" />

> Long synchronous work blocks rendering and input. Split it into chunks that yield back to the event loop, or move it to a Web Worker.

```js
// Yield between chunks so clicks and paints can happen
const yieldToMain = () => new Promise((r) => setTimeout(r, 0));

async function processRows(rows) {
  for (let i = 0; i < rows.length; i += 500) {
    rows.slice(i, i + 500).forEach(transformRow);
    progress.value = i / rows.length;
    await yieldToMain();
  }
}

// Heavy CPU work (CSV parsing, image processing) off the main thread
const worker = new Worker(new URL('./parse.worker.js', import.meta.url), { type: 'module' });
worker.postMessage(fileText);
worker.onmessage = (e) => renderTable(e.data);
```

::: tip When to use
Importing big CSV/Excel files, client-side search indexing, image/PDF processing, anything that shows up as a "Long Task" (>50 ms) in the DevTools Performance panel.
:::
