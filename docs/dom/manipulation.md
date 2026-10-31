# DOM Manipulation

What the DOM is, and how to select, create, change, move and remove elements.

## What the DOM Is

> The DOM (Document Object Model) is the browser's tree representation of the HTML page. JavaScript reads and changes it through Web APIs; it is not part of the JavaScript language.

```js
document.documentElement;   // <html>
document.head;
document.body;

// Every node type inherits from Node → (Element → HTMLElement → HTMLButtonElement…)
const btn = document.querySelector('button');
btn instanceof HTMLButtonElement;   // true
btn instanceof EventTarget;         // true: that's why every node has addEventListener
```

**Node hierarchy:** `EventTarget` → `Node` (`Document`, `Text`, `Comment`, `Element`) → `HTMLElement` → specific elements (`HTMLInputElement`, `HTMLAnchorElement`, …). Methods like `addEventListener` and `append` are shared because of this inheritance.

::: tip When to use
Knowing the hierarchy tells you where to look on MDN: `textContent` is on `Node`, `classList` on `Element`, `dataset` on `HTMLElement`, `value` on `HTMLInputElement`.
:::

## Selecting Elements

> `querySelector` returns the first match for a CSS selector; `querySelectorAll` returns a static `NodeList`. `getElementById` and `getElementsBy*` are older alternatives.

```js
const form = document.querySelector('#checkout-form');
const total = form.querySelector('.summary__total');            // search inside an element
const requiredInputs = form.querySelectorAll('input[required]');
const firstError = document.querySelector('[aria-invalid="true"]');

document.getElementById('modal');                  // fast, no #
document.getElementsByTagName('button');           // live HTMLCollection
document.getElementsByClassName('btn');            // live HTMLCollection

// NodeList has forEach; HTMLCollection doesn't. Convert when in doubt
[...document.getElementsByClassName('btn')].map((b) => b.id);
```

| | `querySelectorAll` | `getElementsBy*` |
| --- | --- | --- |
| Returns | `NodeList` (static snapshot) | `HTMLCollection` (live) |
| Updates when DOM changes | No | Yes |
| `forEach` | Yes | No (spread it first) |

::: tip When to use
`querySelector`/`querySelectorAll` for almost everything (any CSS selector, scoped searches). Select once and keep the reference instead of re-querying in loops.
:::

## Reading and Changing Content

> `textContent` gets/sets plain text (safe); `innerHTML` gets/sets HTML (parses tags); `value` reads form inputs.

```js
message.textContent = 'Saved!';                     // safe: no HTML parsing
priceEl.textContent = money(total, 'pt-BR', 'BRL');

list.innerHTML = '';                                // quick way to clear children
list.innerHTML = items.map((i) => `<li>${escape(i.name)}</li>`).join('');

const email = emailInput.value.trim();
checkbox.checked;                                   // booleans for checkboxes/radios
select.value;                                       // selected option's value
```

::: warning Gotcha
Never put unescaped user input into `innerHTML`: it executes `<img onerror=...>` style payloads (XSS). Use `textContent`, or build elements with `createElement`.
:::

## Creating, Inserting and Deleting Elements

> Create with `createElement` or `insertAdjacentHTML`; insert with `append`/`prepend`/`before`/`after`; remove with `remove()`.

```js
// Build an element safely
const li = document.createElement('li');
li.className = 'notification';
li.textContent = notification.message;
list.prepend(li);                     // first child
list.append(li);                      // moves it: a node can only be in one place
list.append(li.cloneNode(true));      // copy instead

// HTML string at a position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
container.insertAdjacentHTML('afterbegin', `<div class="movement">${mov}€</div>`);

// Siblings
header.before(banner);
header.after(banner);

// Delete
banner.remove();
document.querySelector('.cookie-banner')?.remove();

// Many elements at once: build off-DOM, insert once
const frag = document.createDocumentFragment();
rows.forEach((r) => frag.append(renderRow(r)));
tbody.replaceChildren(frag);          // replaces everything in one reflow
```

::: tip When to use
`createElement` + `textContent` for user data; `insertAdjacentHTML` for trusted templates; a `DocumentFragment` or `replaceChildren` when rendering long lists.
:::

## Styles, Attributes and Classes

> `classList` toggles CSS classes; `style` sets inline styles; `getAttribute`/`setAttribute` and `dataset` handle attributes and `data-*` values.

```js
// Classes: the preferred way to change appearance
modal.classList.add('hidden');
modal.classList.remove('hidden');
modal.classList.toggle('hidden', !isOpen);    // force on/off with a boolean
tab.classList.contains('active');
// el.className = 'x' replaces ALL classes: avoid

// Inline styles (camelCase); values must include units
banner.style.backgroundColor = '#37383d';
banner.style.height = `${banner.offsetHeight + 30}px`;
getComputedStyle(banner).height;              // read the real rendered value

// CSS custom properties: theme switching
document.documentElement.style.setProperty('--color-primary', 'orangered');

// Attributes
logo.alt;                                     // standard props are mapped directly
link.getAttribute('href');                    // '#section--1' (as written)
link.href;                                    // absolute URL
img.setAttribute('aria-hidden', 'true');

// data-* attributes → dataset (camelCase)
// <button data-product-id="381" data-action="add-to-cart">
btn.dataset.productId;     // '381' (always strings)
btn.dataset.action;
```

::: tip When to use
Toggle classes for states (open, active, error, loading) and keep styling in CSS. Use `data-*` to store IDs and config on elements for event delegation. Use CSS variables for themes.
:::

## DOM Traversing

> Move between related elements: `children`, `parentElement`, `closest` (up), `querySelector` (down), and `previousElementSibling`/`nextElementSibling` (sideways).

```js
const h1 = document.querySelector('h1');

// Down
h1.querySelectorAll('.highlight');
h1.children;                  // HTMLCollection of child elements
h1.firstElementChild;

// Up
h1.parentElement;
h1.closest('.header');        // nearest ancestor matching (or itself)

// Sideways
h1.previousElementSibling;
h1.nextElementSibling;
[...h1.parentElement.children].filter((el) => el !== h1);   // all siblings

// Real use: find the card for a clicked button
grid.addEventListener('click', (e) => {
  const card = e.target.closest('.product-card');
  if (!card) return;
  addToCart(card.dataset.id);
});

// Fade out sibling links on hover
nav.addEventListener('mouseover', (e) => {
  if (!e.target.matches('.nav__link')) return;
  e.target.closest('.nav').querySelectorAll('.nav__link')
    .forEach((el) => el !== e.target && (el.style.opacity = 0.5));
});
```

::: tip When to use
`closest` is the workhorse of event delegation: from whatever was clicked, find the meaningful container (card, row, list item). Siblings are useful for tabs, accordions and menus.
:::
