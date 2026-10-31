# Timers

Scheduling code to run later or repeatedly with `setTimeout` and `setInterval`.

## setTimeout

> `setTimeout(callback, ms, ...args)` runs the callback **once** after at least `ms` milliseconds. It returns an ID you can pass to `clearTimeout`.

```js
// Auto-hide a toast
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

// Extra args are passed to the callback
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);   // cancel

// "Undo" window before a destructive action
let pendingDelete;
function deleteWithUndo(id) {
  hideRow(id);
  pendingDelete = setTimeout(() => api.delete(`/items/${id}`), 5000);
}
undoBtn.onclick = () => { clearTimeout(pendingDelete); restoreRow(); };

// Promise-based delay
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(500);
```

::: warning Gotcha
The delay is a **minimum**, not a guarantee. The callback runs only when the call stack is empty (see [The Event Loop](/async/event-loop)), and browsers throttle timers in background tabs.
:::

::: tip When to use
Toasts and auto-dismiss, undo windows, delayed tooltips, debouncing, simple retries with backoff.
:::

## setInterval

> `setInterval(callback, ms)` runs the callback **repeatedly** every `ms` milliseconds until `clearInterval(id)` is called.

```js
// Live clock
const clockId = setInterval(() => {
  clock.textContent = new Intl.DateTimeFormat(navigator.language, { timeStyle: 'medium' }).format(new Date());
}, 1000);

// Polling for job status
const pollId = setInterval(async () => {
  const { status } = await fetch(`/api/exports/${jobId}`).then((r) => r.json());
  if (status === 'done') { clearInterval(pollId); showDownloadLink(); }
}, 2000);

// Always clean up (components, SPA route changes)
onUnmounted(() => clearInterval(clockId));
```

::: tip When to use
Clocks, carousels with autoplay, polling an API, periodic autosave. For async work prefer a recursive `setTimeout` so calls never overlap.
:::

## Implementing a Countdown Timer

> Combine `setInterval`, the remainder operator and `padStart` for countdowns. Run the tick once immediately, then every second.

```js
// Logout after inactivity (banking apps, admin panels)
function startLogoutTimer(seconds = 300) {
  let time = seconds;

  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      logout();
    }
    time--;
  };

  tick();                                   // show immediately, not after 1s
  const timer = setInterval(tick, 1000);
  return timer;
}

// Reset the timer on user activity
let timer;
function resetLogoutTimer() {
  if (timer) clearInterval(timer);
  timer = startLogoutTimer();
}
['click', 'keydown'].forEach((evt) => document.addEventListener(evt, resetLogoutTimer));
```

**More accurate countdowns:** intervals drift. For flash sales or exam timers, compute remaining time from a fixed end date (`endsAt - Date.now()`) on each tick instead of decrementing a counter.

::: tip When to use
Session timeouts, OTP code expiration ("resend in 00:30"), sale countdowns, quiz timers.
:::

## requestAnimationFrame <Badge type="tip" text="extra" />

> `requestAnimationFrame(cb)` runs the callback right before the next repaint (~60 times/second), paused in background tabs. Use it for visual updates instead of timers.

```js
function animateCounter(el, to, duration = 1000) {
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(to * progress).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
animateCounter(revenueEl, 128_400);
```

::: tip When to use
JavaScript-driven animations: animated KPI counters, custom scroll effects, canvas drawing, drag-and-drop position updates.
:::
