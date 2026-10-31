# Scrolling & Observers

Smooth scrolling, scroll-based UI, and the Intersection Observer API for reacting to elements entering the viewport.

## Smooth Scrolling

> `el.scrollIntoView({ behavior: 'smooth' })` scrolls an element into view. `window.scrollTo` scrolls to coordinates.

```js
btnScrollTo.addEventListener('click', () => {
  section1.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Back to top
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Scroll to the first invalid field after submit
form.querySelector(':invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

// Old-school coordinates
const rect = section1.getBoundingClientRect();   // position relative to the viewport
window.scrollTo({ top: rect.top + window.scrollY, behavior: 'smooth' });
```

**Pure CSS alternative:** `html { scroll-behavior: smooth; scroll-padding-top: 80px; }` makes anchor links smooth and accounts for a fixed header.

::: tip When to use
"Learn more" buttons, anchor navigation, scrolling to errors or newly added items (chat messages, the last row).
:::

## The Scroll Event (and Why to Avoid It)

> `window.addEventListener('scroll', ...)` fires many times per second. Doing layout work in it (reading `getBoundingClientRect`) hurts performance.

```js
// Sticky navigation: the naive way
const initialCoords = section1.getBoundingClientRect();
window.addEventListener('scroll', () => {
  nav.classList.toggle('sticky', window.scrollY > initialCoords.top);
});

// Reading-progress bar: OK if cheap and throttled
window.addEventListener('scroll', throttle(() => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${scrollY / max})`;
}, 50), { passive: true });
```

::: tip When to use
Only for values that truly depend on scroll position (progress bars, parallax), and then throttled and `passive`. For "is this element visible?" use Intersection Observer.
:::

## The Intersection Observer API

> `new IntersectionObserver(callback, { root, threshold, rootMargin })` calls back when an observed element **enters or leaves** the viewport (or a container), asynchronously and off the scroll path.

```js
// Sticky nav when the header leaves the viewport
const navHeight = nav.getBoundingClientRect().height;

const headerObserver = new IntersectionObserver(
  ([entry]) => nav.classList.toggle('sticky', !entry.isIntersecting),
  {
    root: null,                       // null = viewport
    threshold: 0,                     // fire as soon as 0% is visible
    rootMargin: `-${navHeight}px`     // shrink the viewport by the nav height
  }
);
headerObserver.observe(header);
```

| Option | Meaning |
| --- | --- |
| `root` | The scroll container (`null` = viewport) |
| `threshold` | Fraction visible that triggers (number or array, e.g. `[0, 0.5, 1]`) |
| `rootMargin` | Grow/shrink the root box, like CSS margin (`'200px'`, `'-90px'`) |
| `entry.isIntersecting` | Whether the target currently intersects |
| `entry.intersectionRatio` | How much of it is visible |

::: tip When to use
Sticky headers, highlighting the current section in a table of contents, pausing videos off-screen, tracking ad/product impressions, infinite scroll.
:::

## Revealing Elements on Scroll

> Hide sections with a CSS class, then remove it when they intersect, and stop observing once revealed.

```js
const revealSection = (entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.remove('section--hidden');
    observer.unobserve(entry.target);          // reveal once, then stop watching
  });
};

const sectionObserver = new IntersectionObserver(revealSection, { threshold: 0.15 });
document.querySelectorAll('.section').forEach((section) => {
  section.classList.add('section--hidden');     // add via JS so no-JS users still see content
  sectionObserver.observe(section);
});
```

```css
.section { transition: transform 0.8s, opacity 0.8s; }
.section--hidden { opacity: 0; transform: translateY(8rem); }
@media (prefers-reduced-motion: reduce) { .section--hidden { opacity: 1; transform: none; } }
```

::: tip When to use
Landing pages and marketing sites. Respect `prefers-reduced-motion`.
:::

## Lazy Loading Images

> Load a tiny placeholder first and swap in the real image (from `data-src`) when it's about to enter the viewport.

```js
// <img src="img/digital-lazy.jpg" data-src="img/digital.jpg" class="lazy-img" alt="...">
const loadImg = (entries, observer) => {
  entries.forEach(({ isIntersecting, target: img }) => {
    if (!isIntersecting) return;
    img.src = img.dataset.src;
    img.addEventListener('load', () => img.classList.remove('lazy-img'), { once: true }); // remove blur after load
    observer.unobserve(img);
  });
};

const imgObserver = new IntersectionObserver(loadImg, { rootMargin: '200px' }); // start before visible
document.querySelectorAll('img[data-src]').forEach((img) => imgObserver.observe(img));

// Infinite scroll uses the same pattern with a sentinel element at the end of the list
new IntersectionObserver(([e]) => e.isIntersecting && loadNextPage()).observe(sentinel);
```

**Native option:** `<img loading="lazy">` handles most cases with no JavaScript. Use the observer when you need blur-up effects, background images or infinite scroll.

::: tip When to use
Image-heavy pages (galleries, product grids, blogs), infinite feeds, and deferring heavy widgets (maps, embeds, charts) until they're near the viewport.
:::

## Resize and Mutation Observers <Badge type="tip" text="extra" />

> `ResizeObserver` reacts when an **element** changes size; `MutationObserver` reacts when the DOM tree or attributes change.

```js
// Responsive component based on its own width, not the window
new ResizeObserver(([entry]) => {
  const w = entry.contentRect.width;
  chartEl.classList.toggle('chart--compact', w < 480);
  chart.resize();
}).observe(chartEl);

// React to third-party widgets injecting nodes
new MutationObserver((mutations) => {
  for (const m of mutations) m.addedNodes.forEach((n) => n.matches?.('.ad') && n.remove());
}).observe(document.body, { childList: true, subtree: true });
```

::: tip When to use
ResizeObserver: charts, canvases, text truncation, container-based layouts. MutationObserver: integrating with code you don't control.
:::
