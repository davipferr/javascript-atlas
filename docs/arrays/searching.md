# Searching & Testing

Finding a single element, its index, or checking whether some or all elements match.

## The find Method

> `arr.find((item) => condition)` returns the **first** element that matches, or `undefined`. It returns the element, not an array.

```js
const firstWithdrawal = movements.find((mov) => mov < 0);

// Login: find the account by username
const currentAccount = accounts.find((acc) => acc.username === inputUser.value);
if (currentAccount?.pin === Number(inputPin.value)) showApp(currentAccount);

// Route matching
const route = routes.find((r) => r.path === location.pathname) ?? notFoundRoute;

// Selected item in a list
const selected = products.find((p) => p.id === Number(e.target.dataset.id));
```

| `find` | `filter` |
| --- | --- |
| Returns the first match | Returns all matches |
| Element or `undefined` | Always an array (possibly empty) |
| Stops at the first match | Always walks the whole array |

::: tip When to use
Looking up one record by ID, username, slug or path. For repeated lookups over big arrays, build a `Map` by ID once.
:::

## The findIndex Method

> `arr.findIndex((item) => condition)` returns the **index** of the first match, or `-1`. Use it when you need to update or remove by position.

```js
// Close account: remove it by index
const index = accounts.findIndex((acc) => acc.username === currentAccount.username);
if (index !== -1) accounts.splice(index, 1);

// Replace an item immutably
const i = todos.findIndex((t) => t.id === updated.id);
const next = todos.with(i, updated);

// indexOf only works with exact values, findIndex takes a condition
[10, 20, 30].indexOf(20);               // 1
users.findIndex((u) => u.age > 18);     // condition
```

::: tip When to use
Updating/removing an element in place, moving items in a sortable list, highlighting the current step in a wizard.
:::

## findLast and findLastIndex

> Same as `find`/`findIndex` but searching from the **end**: the last element that matches.

```js
const lastWithdrawal = movements.findLast((mov) => mov < 0);
const latestLargeIdx = movements.findLastIndex((mov) => Math.abs(mov) > 1000);

// Most recent successful build, message from a user, error in a log
const lastSuccess = builds.findLast((b) => b.status === 'success');
const lastReadIdx = messages.findLastIndex((m) => m.readAt);
```

::: tip When to use
Chronological data where the end is "newest": logs, chat messages, transactions, deployments.
:::

## some and every

> `some` returns `true` if **at least one** element passes; `every` returns `true` only if **all** pass. Both stop early.

```js
movements.includes(-130);                       // equality check
movements.some((mov) => mov > 0);               // any deposit?

// Loan rule: grant if any deposit ≥ 10% of the requested amount
const canLoan = currentAccount.movements.some((mov) => mov >= amount * 0.1);

// Form validation
const allValid = [...form.elements].every((el) => el.checkValidity());
const hasErrors = fields.some((f) => f.error);
submitBtn.disabled = !allValid;

// Cart rules
const allInStock = cart.every((line) => line.qty <= stockOf(line.sku));
const needsShipping = cart.some((line) => !line.isDigital);

// Empty arrays: every → true, some → false
[].every(Boolean);   // true
```

::: tip When to use
Validations, permission checks (`user.roles.some(...)`), enabling/disabling buttons, business rules over a list.
:::
