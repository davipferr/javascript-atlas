# Conditionals

Taking decisions: if/else, switch, the ternary operator and the expression vs statement distinction behind them.

## if / else Statements

> `if (condition) { ... } else if (...) { ... } else { ... }` runs the first block whose condition is truthy.

```js
function shippingCost(order) {
  if (order.total >= 100) {
    return 0;                               // free shipping
  } else if (order.country === 'PT') {
    return 4.99;
  } else {
    return 14.99;
  }
}

// Guard clauses: exit early instead of nesting
function submitForm(form) {
  if (!form.email) return showError('Email is required');
  if (!form.terms) return showError('Accept the terms');
  if (isSubmitting) return;

  isSubmitting = true;
  api.post('/signup', form);
}
```

::: tip When to use
Any branching on ranges or combined conditions. Prefer **guard clauses** (early `return`) over deeply nested `if`s, because the happy path stays flat and readable.
:::

## The switch Statement

> `switch` compares one value against several `case`s with `===`. Without `break`, execution falls through to the next case.

```js
function statusBadge(status) {
  switch (status) {
    case 'pending':
    case 'processing':          // fall-through groups cases
      return { color: 'amber', label: 'In progress' };
    case 'shipped':
      return { color: 'blue', label: 'On the way' };
    case 'delivered':
      return { color: 'green', label: 'Delivered' };
    default:
      return { color: 'gray', label: 'Unknown' };
  }
}

// Reducer-style state updates
function cartReducer(state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, items: [...state.items, action.item] };
    case 'clear':
      return { ...state, items: [] };
    default:
      return state;
  }
}
```

::: tip When to use
Mapping one discrete value (status, action type, key name, route) to behavior. For pure value lookups, an object map is often shorter: `const labels = { shipped: 'On the way' }; labels[status] ?? 'Unknown'`.
:::

## Statements and Expressions

> An **expression** produces a value (`3 + 4`, `user.name`, `isOk ? a : b`). A **statement** performs an action and doesn't produce a value (`if`, `for`, `const x = ...`).

```js
// Expressions can go anywhere a value is expected
const msg = `You are ${age >= 18 ? 'an adult' : 'a minor'}`;   // ✅

// Statements can't
// const msg = `You are ${if (age >= 18) 'adult'}`;            // ❌ SyntaxError

// Same idea in JSX and Vue templates: only expressions are allowed
// {items.length > 0 && <List items={items} />}
// {isLoading ? <Spinner /> : <Table />}
```

::: tip When to use
This rule explains why template literals, JSX and Vue bindings accept ternaries and `&&` but not `if` statements.
:::

## The Conditional (Ternary) Operator

> `condition ? valueIfTrue : valueIfFalse` is an **expression**, so it can be assigned, returned or interpolated.

```js
const label = cart.length === 1 ? 'item' : 'items';
const fee = user.isPremium ? 0 : 2.5;

button.textContent = isPlaying ? 'Pause' : 'Play';
el.classList.toggle('hidden', !isOpen);

// Inline in templates
const row = `<tr class="${order.overdue ? 'row--danger' : ''}">...</tr>`;

// Chained ternaries: fine for 2–3 flat options, format one per line
const tier =
  points > 1000 ? 'gold' :
  points > 500  ? 'silver' :
                  'bronze';
```

::: tip When to use
Choosing between two values. If you need side effects or more than ~3 branches, use `if` or `switch` instead.
:::
