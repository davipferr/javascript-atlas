# Operators

Arithmetic, assignment, comparison and logical operators, plus the order they run in.

## Arithmetic and Assignment Operators

> `+ - * / % **` do math; `= += -= *= /= **= ++ --` assign. `+` also concatenates strings.

```js
const subtotal = 120;
const tax = subtotal * 0.23;
const total = subtotal + tax;
const monthly = total / 12;
const squaredError = (actual - predicted) ** 2;

let views = 0;
views += 1;        // views = views + 1
views++;           // postfix: returns old value, then increments

let label = 'Total: ';
label += total.toFixed(2);   // 'Total: 147.60'

// + with a string turns everything into a string
'3' + 2;   // '32'
'3' - 2;   // 1   (- * / always convert to number)
```

::: tip When to use
`+=` for building up totals or strings in loops, `**` instead of `Math.pow`, and `%` for "every Nth" logic (see [Numbers & Math](/numbers-dates/numbers)).
:::

## Comparison Operators

> `> < >= <=` return booleans. `===` and `!==` compare without type conversion.

```js
const age = 17;
const isAdult = age >= 18;              // false
const canCheckout = cart.length > 0 && isLoggedIn;

// Strings compare by UTF-16 code unit, not by human alphabet
'apple' < 'banana';   // true
'Zebra' < 'apple';    // true: uppercase letters come first
'10' < '9';           // true: string comparison!
Number('10') < Number('9'); // false

// For human-friendly string sorting use localeCompare
['ä', 'z', 'a'].sort((a, b) => a.localeCompare(b, 'de'));
```

::: warning Gotcha
Comparing numeric strings from inputs (`input.value`) compares them as text. Convert first with `Number(...)`.
:::

## Operator Precedence

> Operators run by precedence (`*` before `+`) and associativity (assignment runs right-to-left, most others left-to-right).

```js
const total = 10 + 5 * 2;         // 20, not 30
const avg = (a + b) / 2;          // parentheses beat everything

let x, y;
x = y = 25 - 10 - 5;              // math left-to-right → 10, then assigned right-to-left: y = 10, x = 10

// Logical: ! before && before || before ??
const show = !isHidden && hasData || isDebug;   // (!isHidden && hasData) || isDebug
// a ?? b || c   ❌ SyntaxError: mixing ?? with || needs parentheses
```

Rough order (high → low): grouping `()` → member access `.` `[]` `?.` → call `()` → `new` → `!` `typeof` `++` → `**` → `* / %` → `+ -` → `< > <= >=` → `=== !==` → `&&` → `||` `??` → `?:` → assignment `=` `+=`…

::: tip When to use
When in doubt, add parentheses. Readers shouldn't need the precedence table to understand your condition.
:::

## Logical Operators and Boolean Logic

> `&&` (AND), `||` (OR) and `!` (NOT) combine conditions. They work on any values, not only booleans, and short-circuit.

```js
const hasSubscription = user.plan !== 'free';
const isTrialActive = Date.now() < user.trialEndsAt;

const canWatchPremium = hasSubscription || isTrialActive;
const shouldShowPaywall = !canWatchPremium && !user.isAdmin;

// De Morgan: !(a && b) === !a || !b
const isInvalid = !(email.includes('@') && password.length >= 8);
const isInvalid2 = !email.includes('@') || password.length < 8; // same thing
```

| A | B | `A && B` | `A \|\| B` |
| --- | --- | --- | --- |
| true | true | true | true |
| true | false | false | true |
| false | true | false | true |
| false | false | false | false |

They actually return one of the **operands**, not a boolean. This powers default values and conditional calls; see [Short-Circuiting](/data-structures/modern-operators#short-circuiting-and).

::: tip When to use
Permission checks, feature flags, form validation rules. Extract each sub-condition into a well-named `const` so the final expression reads like a sentence.
:::

## The Comma, void and in Operators <Badge type="tip" text="extra" />

> Small operators you'll meet in real code: `in` checks if a property exists, `void` discards a value, and the comma operator evaluates several expressions.

```js
'geolocation' in navigator;    // feature detection
'id' in product;               // true even if product.id is undefined
delete product.tempField;      // removes a property

// Arrow that must return undefined (e.g. React effects)
el.addEventListener('click', () => void trackClick());

for (let i = 0, j = arr.length - 1; i < j; i++, j--) { /* two pointers */ }
```

::: tip When to use
`in` for feature detection (`'IntersectionObserver' in window`) and to distinguish "missing" from "set to undefined".
:::
