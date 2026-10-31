# Events

Listening to user actions, how events travel through the DOM, and delegating them efficiently.

## Handling Events with addEventListener

> `el.addEventListener(type, handler, options)` runs the handler every time the event fires. You can add many handlers per event and remove them later.

```js
const btn = document.querySelector('.btn--save');

function handleSave(e) {
  e.preventDefault();               // stop default behavior (form submit, link navigation)
  save(new FormData(form));
}
btn.addEventListener('click', handleSave);
btn.removeEventListener('click', handleSave);   // needs the SAME function reference

// Options
el.addEventListener('click', handler, { once: true });      // auto-remove after first call
el.addEventListener('touchstart', handler, { passive: true }); // promise not to preventDefault → smoother scroll

// Remove several listeners at once with AbortController
const ac = new AbortController();
window.addEventListener('resize', onResize, { signal: ac.signal });
window.addEventListener('keydown', onKey, { signal: ac.signal });
ac.abort();                                     // removes both

// Old style: only one handler per event, overwritten by the next assignment
btn.onclick = () => {};
```

::: tip When to use
Always `addEventListener` in modern code. Use `{ once: true }` for one-shot actions (intro animations, first-interaction audio unlock) and `AbortController` to clean up in components.
:::

## Types of Events

> The browser fires events for mouse, keyboard, form, focus, clipboard, drag, touch/pointer, media, scroll/resize and page lifecycle actions.

| Category | Events | Real use |
| --- | --- | --- |
| Mouse / pointer | `click`, `dblclick`, `mouseenter`, `mouseleave`, `pointerdown`, `pointermove` | Buttons, hover cards, drawing, drag |
| Keyboard | `keydown`, `keyup` | Shortcuts, closing modals with Esc, keyboard navigation |
| Form | `input`, `change`, `submit`, `reset`, `invalid` | Live validation, autosave, search |
| Focus | `focus`, `blur`, `focusin`, `focusout` | Show hints, validate on blur |
| Window | `scroll`, `resize`, `hashchange`, `popstate` | Sticky nav, responsive JS, routing |
| Clipboard | `copy`, `paste` | Paste images, sanitize pasted text |
| Lifecycle | `DOMContentLoaded`, `load`, `beforeunload`, `visibilitychange` | Init, unsaved-changes warnings, pausing |

```js
// Live validation as the user types vs when they leave the field
emailInput.addEventListener('input', () => clearError(emailInput));
emailInput.addEventListener('blur', () => validateEmail(emailInput));

// Form submit (also fires on Enter)
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  api.post('/contact', data);
});

// mouseenter doesn't bubble; mouseover does
card.addEventListener('mouseenter', () => preloadDetails(card.dataset.id));
```

::: tip When to use
`input` for live feedback, `change` for committed values (selects, checkboxes), `submit` on the form (not `click` on the button) so Enter and accessibility work.
:::

## Keyboard Events

> `keydown` fires on press (and repeats while held). Read `e.key` for the logical key (`'Escape'`, `'Enter'`, `'a'`) and modifier flags like `e.ctrlKey`.

```js
// Close a modal with Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
});

// Command palette: Ctrl/Cmd + K
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openPalette();
  }
});

// Arrow keys in a slider / listbox
slider.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft') prevSlide();
});

// Don't trigger shortcuts while typing in an input
if (e.target.closest('input, textarea, [contenteditable]')) return;
```

::: tip When to use
Global shortcuts, closing overlays, accessible custom widgets (tabs, menus, sliders). Listen on `document` for global keys.
:::

## Event Propagation: Bubbling and Capturing

> An event travels **down** from `document` to the target (capturing phase), fires on the target, then **bubbles back up** through every ancestor. Handlers run in the bubbling phase by default.

```js
// <nav class="nav"><ul class="nav__links"><li><a class="nav__link">Features</a></li></ul></nav>
link.addEventListener('click', (e) => {
  console.log('LINK', e.target, e.currentTarget);   // target = link, currentTarget = link
});
container.addEventListener('click', (e) => {
  console.log('CONTAINER', e.target, e.currentTarget); // target = link, currentTarget = container
});
nav.addEventListener('click', () => console.log('NAV'), true);   // capture: runs FIRST

// Stop the event from reaching ancestors (use sparingly)
dropdown.addEventListener('click', (e) => e.stopPropagation());

// Click outside to close: relies on bubbling up to document
document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && !toggleBtn.contains(e.target)) closeMenu();
});
```

| Property | Meaning |
| --- | --- |
| `e.target` | The element where the event originated (what was actually clicked) |
| `e.currentTarget` | The element the handler is attached to (same as `this` in a regular function) |

::: warning Gotcha
`stopPropagation` breaks other listeners up the tree, such as analytics, "click outside" handlers and delegated handlers. Prefer checking `e.target` instead.
:::

## Event Delegation

> Attach **one** listener to a common parent and use `e.target` (with `closest`/`matches`) to figure out which child was clicked. Works for elements added later, too.

```js
// Smooth-scroll navigation: one listener instead of one per link
document.querySelector('.nav__links').addEventListener('click', (e) => {
  e.preventDefault();
  const link = e.target.closest('.nav__link');
  if (!link) return;                                    // guard clause: clicked between links
  document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
});

// Dynamic list: works for items rendered after page load
todoList.addEventListener('click', (e) => {
  const item = e.target.closest('[data-id]');
  if (!item) return;
  const { id } = item.dataset;
  if (e.target.matches('.btn--delete')) removeTodo(id);
  if (e.target.matches('.checkbox')) toggleTodo(id);
});

// Tabbed component
tabsContainer.addEventListener('click', (e) => {
  const clicked = e.target.closest('.operations__tab');
  if (!clicked) return;
  tabs.forEach((t) => t.classList.remove('operations__tab--active'));
  contents.forEach((c) => c.classList.remove('operations__content--active'));
  clicked.classList.add('operations__tab--active');
  document.querySelector(`.operations__content--${clicked.dataset.tab}`).classList.add('operations__content--active');
});
```

::: tip When to use
Lists, tables, grids, menus and tabs, and especially anything rendered dynamically (search results, infinite scroll). One listener uses less memory and survives re-renders.
:::

## Passing Arguments to Event Handlers

> Handlers receive only the event. To pass extra data, wrap in an arrow, use `bind`, or read `data-*` attributes from the element.

```js
const handleHover = function (e, opacity) {
  if (!e.target.classList.contains('nav__link')) return;
  const siblings = e.target.closest('.nav').querySelectorAll('.nav__link');
  siblings.forEach((el) => { if (el !== e.target) el.style.opacity = opacity; });
};

// 1. Arrow wrapper
nav.addEventListener('mouseover', (e) => handleHover(e, 0.5));

// 2. bind: "this" becomes the argument
function handleHoverBound(e) { /* uses this as opacity */ }
nav.addEventListener('mouseout', handleHoverBound.bind(1));

// 3. Data attributes (best with delegation)
// <button data-qty="5">+5</button>
toolbar.addEventListener('click', (e) => {
  const qty = Number(e.target.closest('[data-qty]')?.dataset.qty);
  if (qty) addQuantity(qty);
});
```

::: tip When to use
Arrow wrappers for one-off arguments; `data-*` attributes when the value belongs to the element (IDs, amounts, actions). Remember an inline arrow can't be removed later with `removeEventListener`, so store the reference if you need to.
:::

## Custom Events <Badge type="tip" text="extra" />

> `new CustomEvent(name, { detail })` + `dispatchEvent` let your own components emit events that other code listens to, with no framework needed.

```js
// Inside a cart component
function addItem(item) {
  items.push(item);
  document.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: items.length } }));
}

// Anywhere else (header badge, analytics)
document.addEventListener('cart:updated', (e) => {
  badge.textContent = e.detail.count;
});
```

::: tip When to use
Decoupling vanilla JS widgets, Web Components that emit events, micro-frontends talking to each other.
:::
