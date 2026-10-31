# Dates & Intl

Creating and calculating with `Date`, and formatting dates and numbers for any locale with the `Intl` API.

## Creating Dates

> `new Date()` creates a date for now; you can also pass an ISO string, a timestamp (ms since 1970-01-01 UTC) or year/month/day parts. **Months are 0-based.**

```js
const now = new Date();
new Date('2026-10-30T14:30:00Z');       // ISO string: safest format to parse
new Date(2026, 9, 30, 15, 23);          // Oct 30 2026 15:23 local time (month 9 = October!)
new Date(0);                            // 1970-01-01T00:00:00Z
new Date(3 * 24 * 60 * 60 * 1000);      // 3 days after the epoch

const d = new Date(order.createdAt);
d.getFullYear();   // 2026
d.getMonth();      // 9 (October)
d.getDate();       // 30 (day of month)
d.getDay();        // 5 (day of week, 0 = Sunday)
d.getTime();       // timestamp in ms
d.toISOString();   // '2026-10-30T14:30:00.000Z': store/send this
Date.now();        // current timestamp

d.setFullYear(2027);   // mutates
```

::: warning Gotcha
`new Date('2026-10-30')` (date only) is parsed as **UTC**, while `new Date('2026-10-30T00:00')` is **local**. That's how a date shows as "Oct 29" for users west of UTC. Store ISO timestamps, display with Intl.
:::

::: tip When to use
Timestamps for created/updated fields, deadlines and expirations. Exchange dates with APIs as ISO strings; for heavy timezone work use a library (date-fns, Luxon) or `Temporal` where supported.
:::

## Operations With Dates

> Dates convert to timestamps when you subtract them, so date math is millisecond math.

```js
const DAY = 1000 * 60 * 60 * 24;

const daysBetween = (a, b) => Math.round(Math.abs(b - a) / DAY);
daysBetween(new Date(2026, 3, 4), new Date(2026, 3, 14));   // 10

// "Today", "Yesterday", "3 days ago"
function formatMovementDate(date, locale) {
  const days = daysBetween(new Date(), date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days <= 7) return `${days} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
}

// Add days (handles month overflow)
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
const trialEnds = addDays(new Date(), 14);

// Expired?
const isExpired = new Date(coupon.expiresAt) < new Date();

// Sort by date
events.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
```

::: tip When to use
Relative times in feeds, countdowns, trial periods, expiration checks, sorting by date.
:::

## Internationalizing Dates (Intl)

> `new Intl.DateTimeFormat(locale, options).format(date)` formats dates for any language and region, with no manual string building.

```js
const date = new Date('2026-10-30T14:30:00Z');

new Intl.DateTimeFormat('en-US').format(date);   // '10/30/2026'
new Intl.DateTimeFormat('pt-BR').format(date);   // '30/10/2026'
new Intl.DateTimeFormat('de-DE').format(date);   // '30.10.2026'

const options = {
  hour: 'numeric', minute: 'numeric',
  day: 'numeric', month: 'long', year: 'numeric', weekday: 'long',
  timeZone: 'America/Sao_Paulo'
};
new Intl.DateTimeFormat('pt-BR', options).format(date);  // 'sexta-feira, 30 de outubro de 2026 11:30'

// Use the browser's language and show a specific timezone
const fmt = new Intl.DateTimeFormat(navigator.language, {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Sao_Paulo'
});

// Relative time: "in 3 days", "2 hours ago"
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
rtf.format(-1, 'day');      // 'yesterday'
rtf.format(3, 'hour');      // 'in 3 hours'

// Shortcut
date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); // '30 Oct'
```

::: tip When to use
Every user-facing date. Create the formatter once and reuse it in lists (constructing `Intl` objects is relatively expensive).
:::

## Internationalizing Numbers (Intl)

> `new Intl.NumberFormat(locale, options).format(n)` handles separators, currencies, percents, units and compact notation.

```js
const n = 3884764.23;

new Intl.NumberFormat('en-US').format(n);   // '3,884,764.23'
new Intl.NumberFormat('de-DE').format(n);   // '3.884.764,23'

// Currency
const money = (value, locale, currency) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
money(1299.9, 'pt-BR', 'BRL');   // 'R$ 1.299,90'
money(1299.9, 'en-US', 'USD');   // '$1,299.90'

// Units, percent, compact
new Intl.NumberFormat('en', { style: 'unit', unit: 'kilometer-per-hour' }).format(120); // '120 km/h'
new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 1 }).format(0.4567); // '45.7%'
new Intl.NumberFormat('en', { notation: 'compact' }).format(1_250_000);   // '1.3M'

// Lists and plurals
new Intl.ListFormat('en', { type: 'conjunction' }).format(['Ana', 'Bia', 'Carla']); // 'Ana, Bia, and Carla'
new Intl.PluralRules('en').select(1);   // 'one' → choose 'item' vs 'items'
```

::: tip When to use
Prices, KPIs on dashboards (compact notation), percentages, file sizes and speeds, and any number shown to users in more than one locale.
:::
