# Page Lifecycle & Script Loading

Events that mark the stages of a page's life, and how `defer`/`async` change when scripts run.

## DOMContentLoaded

> Fires when the HTML is fully parsed and the DOM tree is built, **without** waiting for images, stylesheets or iframes.

```js
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  hydrateWidgets();
});
```

::: tip When to use
Only needed for classic scripts in `<head>` without `defer`. Scripts with `defer` or `type="module"`, or placed at the end of `<body>`, already run after parsing.
:::

## load

> `window` fires `load` when **everything** is loaded: images, CSS, fonts, iframes.

```js
window.addEventListener('load', () => {
  document.body.classList.remove('preload');      // enable transitions only after load
  measureLayout();                                // image sizes are known now
  performance.getEntriesByType('navigation')[0].loadEventStart;  // performance metrics
});

// Single image
img.addEventListener('load', () => img.classList.add('loaded'));
img.addEventListener('error', () => (img.src = '/img/fallback.png'));
```

::: tip When to use
Work that depends on final layout or image dimensions (masonry grids, measuring), hiding a full-page loader, starting non-critical scripts.
:::

## beforeunload

> Fires right before the user leaves the page. Calling `preventDefault()` shows the browser's generic "Leave site?" dialog.

```js
let hasUnsavedChanges = false;
form.addEventListener('input', () => (hasUnsavedChanges = true));
form.addEventListener('submit', () => (hasUnsavedChanges = false));

window.addEventListener('beforeunload', (e) => {
  if (!hasUnsavedChanges) return;
  e.preventDefault();          // browsers show their own message; custom text is ignored
});
```

::: warning Gotcha
Don't use it unconditionally: it annoys users and disables the back/forward cache. Add it only while there are unsaved changes.
:::

::: tip When to use
Editors, long forms, file uploads in progress: anything where leaving loses work.
:::

## visibilitychange <Badge type="tip" text="extra" />

> `document.visibilityState` becomes `'hidden'` when the tab goes to the background or the user switches apps, and `'visible'` again when it returns.

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    video.pause();
    stopPolling();
    navigator.sendBeacon('/analytics', JSON.stringify(sessionStats));  // reliable last chance to send
  } else {
    startPolling();
    refreshIfStale();
  }
});
```

::: tip When to use
Pausing media, polling and animations; refreshing stale data when the user returns; sending final analytics (more reliable than `unload` on mobile).
:::

## Efficient Script Loading: defer and async

> A plain `<script>` blocks HTML parsing while it downloads and runs. `defer` downloads in parallel and runs **after parsing, in order**; `async` downloads in parallel and runs **as soon as it's ready, in any order**.

```html
<head>
  <!-- App code: parallel download, runs in order after parsing -->
  <script defer src="/js/vendor.js"></script>
  <script defer src="/js/app.js"></script>

  <!-- Independent third-party: order doesn't matter -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>

  <!-- ES modules are deferred by default -->
  <script type="module" src="/js/main.js"></script>
</head>
```

| | Regular in `<head>` | End of `<body>` | `async` in `<head>` | `defer` in `<head>` |
| --- | --- | --- | --- | --- |
| Blocks parsing | Download + run | No (but download starts late) | Only while running | Never |
| Execution order | In order | In order | **Not guaranteed** | In order |
| Runs relative to `DOMContentLoaded` | Before | Before | Maybe after | Before (DCL waits for it) |
| Best for | Avoid | Legacy fallback | Analytics, ads, independent widgets | **Your own app scripts** |

::: tip When to use
`defer` (or `type="module"`) in `<head>` for your own code, `async` for third-party scripts that don't depend on anything. Bundlers like Vite already emit module scripts.
:::
