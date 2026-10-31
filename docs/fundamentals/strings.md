# Strings

Template literals and the string methods you use every day for formatting, parsing and cleaning text.

## Template Literals

> Backtick strings interpolate any expression with `${}` and can span multiple lines.

```js
const user = { first: 'Ana', unread: 3 };
const greeting = `Hi ${user.first}, you have ${user.unread} new message${user.unread === 1 ? '' : 's'}`;

// Multi-line HTML snippets
const card = `
  <article class="product">
    <h3>${product.name}</h3>
    <p>${formatPrice(product.price)}</p>
  </article>
`;
list.insertAdjacentHTML('beforeend', card);

// Readable URLs
const url = `${API}/users/${userId}/orders?page=${page}&limit=${limit}`;
```

::: warning Gotcha
Interpolating user input into HTML opens an XSS hole. Use `textContent` or escape values for anything a user can type.
:::

::: tip When to use
Any string that mixes text and values: messages, URLs, CSS values (`` `${x}px` ``), HTML templates for trusted data.
:::

## Tagged Templates <Badge type="tip" text="extra" />

> A function placed before a template literal receives the raw string parts and values separately, so it can transform them.

```js
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function safeHtml(strings, ...values) {
  return strings.reduce((out, str, i) => out + str + (i < values.length ? escape(values[i]) : ''), '');
}

const comment = '<img src=x onerror=alert(1)>';
el.innerHTML = safeHtml`<p class="comment">${comment}</p>`; // escaped

// Libraries built on this: styled-components (css``), lit (html``), graphql-tag (gql``)
```

::: tip When to use
Auto-escaping HTML, SQL query builders with parameters, CSS-in-JS. You'll mostly consume them through libraries.
:::

## Searching and Extracting

> `indexOf`, `includes`, `startsWith`, `endsWith` find text; `slice` extracts it by position.

```js
const email = 'ana.silva@company.com';

email.includes('@');                    // true
email.endsWith('@company.com');         // true: company account?
'https://x.com'.startsWith('https');    // true

const at = email.indexOf('@');          // 9
const username = email.slice(0, at);    // 'ana.silva'
const domain = email.slice(at + 1);     // 'company.com'

const file = 'report.final.pdf';
const ext = file.slice(file.lastIndexOf('.') + 1);   // 'pdf'
file.slice(-3);                         // 'pdf': negative counts from the end
file.at(-1);                            // 'f'

'card-4421'.slice(-4).padStart(9, '*'); // '*****4421'
```

::: tip When to use
Parsing file extensions, domains, IDs from slugs, and checking prefixes like `http`, `/api` or `#`.
:::

## Transforming and Cleaning

> `toLowerCase`, `toUpperCase`, `trim`, `replace`, `replaceAll`, `padStart` and `repeat` return **new** strings (strings are immutable).

```js
// Normalize user input before comparing or saving
const normalizedEmail = '  Ana.Silva@Company.COM \n'.trim().toLowerCase();

// Capitalize a name
const capitalize = (s) => s[0].toUpperCase() + s.slice(1).toLowerCase();
capitalize('jOÃO');                       // 'João'

// Prices from European input
const raw = '1.299,90';
const value = Number(raw.replaceAll('.', '').replace(',', '.'));   // 1299.9

// Slugify a title
const slug = 'Hello World: JS Atlas!'
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')   // strip accents
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');                              // 'hello-world-js-atlas'

// Fixed-width output
String(7).padStart(3, '0');    // '007': invoice numbers, times
'='.repeat(20);
```

::: tip When to use
Normalizing emails/usernames, building slugs and filenames, formatting codes and times (`padStart`), masking card numbers.
:::

## split and join

> `split` breaks a string into an array; `join` glues an array back into a string. Together they let you use array methods on text.

```js
const csvLine = 'Ana,32,Lisbon';
const [name, age, city] = csvLine.split(',');

const tags = 'js, css , html'.split(',').map((t) => t.trim());  // ['js','css','html']

// Title Case
const toTitle = (s) => s.split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

// Parse a query-like string
const params = Object.fromEntries('a=1&b=2'.split('&').map((p) => p.split('=')));

// snake_case → camelCase
const camel = 'first_name'.split('_').map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w)).join('');

const lines = text.split(/\r?\n/);   // split by regex
```

::: tip When to use
Parsing CSV lines, tags input, file paths, multi-line text areas, and any word-by-word transformation.
:::
