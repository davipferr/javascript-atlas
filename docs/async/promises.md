# Promises & fetch

Asynchronous code, AJAX, the callback era, and Promises as the modern foundation.

## Synchronous vs Asynchronous Code

> Synchronous code runs line by line and each line **blocks** the next. Asynchronous code starts a task in the background and continues; a callback/promise handles the result later.

```js
// Synchronous: alert blocks everything until dismissed
alert('Blocking!');

// Asynchronous: the rest runs immediately, the callback runs later
const img = document.querySelector('.dog');
img.src = 'dog.jpg';                          // loads in the background
img.addEventListener('load', () => img.classList.add('fade-in'));
console.log('This runs first');

setTimeout(() => console.log('Later'), 0);
console.log('Still first');
```

**AJAX** (Asynchronous JavaScript And XML) means requesting data from a server without reloading the page. Today the data is almost always JSON, and the tool is `fetch`.

::: tip When to use
Everything that waits on something external is async: network requests, timers, file reads, geolocation, user permissions, animations finishing.
:::

## How the Web Works: Requests and Responses

> The browser sends an HTTP **request** (method, URL, headers, optional body) and the server returns a **response** (status code, headers, body). DNS lookup and a TCP/TLS connection happen first.

```js
const res = await fetch('https://api.shop.dev/v1/orders', {
  method: 'POST',                                   // GET, POST, PUT, PATCH, DELETE
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ productId: 381, qty: 2 })
});

res.status;            // 201
res.ok;                // true for 200–299
res.headers.get('Content-Type');
```

| Status | Meaning | Typical handling |
| --- | --- | --- |
| 200 / 201 / 204 | OK / Created / No Content | Use the data |
| 301 / 304 | Redirect / Not Modified | Handled by the browser |
| 400 / 422 | Bad request / Validation failed | Show field errors |
| 401 / 403 | Not authenticated / Not allowed | Redirect to login / show "no access" |
| 404 | Not found | Empty state / 404 page |
| 429 | Too many requests | Back off and retry |
| 500 / 503 | Server error / Unavailable | Generic error, retry later |

::: tip When to use
Debugging in DevTools → Network: check the method, status, request payload and response before suspecting your JavaScript.
:::

## XMLHttpRequest and Callback Hell

> Before Promises, async results came through callbacks. Requests that depend on each other end up **nested** inside each other: callback hell.

```js
// Old-school AJAX
const request = new XMLHttpRequest();
request.open('GET', `https://restcountries.com/v3.1/name/portugal`);
request.send();
request.addEventListener('load', function () {
  const [data] = JSON.parse(this.responseText);

  // Dependent request → nested callback
  const neighbour = data.borders?.[0];
  const request2 = new XMLHttpRequest();
  request2.open('GET', `https://restcountries.com/v3.1/alpha/${neighbour}`);
  request2.send();
  request2.addEventListener('load', function () {
    // ...and another level, and another
  });
});

// The same shape with timers
setTimeout(() => {
  console.log('1 second');
  setTimeout(() => {
    console.log('2 seconds');
    setTimeout(() => console.log('3 seconds'), 1000);
  }, 1000);
}, 1000);
```

::: tip When to use
You'll still meet callback APIs in older libraries and some Node APIs. Wrap them in Promises ([promisifying](/async/async-await#promisifying-callback-apis)) instead of nesting.
:::

## Promises and the Fetch API

> A **Promise** is a placeholder for a future value. It starts **pending** and settles once: **fulfilled** with a value or **rejected** with an error. `fetch` returns a Promise of a `Response`.

```js
const request = fetch('https://restcountries.com/v3.1/name/portugal');
console.log(request);   // Promise {<pending>}
```

| State | Meaning |
| --- | --- |
| Pending | The async task is still running |
| Fulfilled | Success: a value is available |
| Rejected | Failure: an error is available |
| Settled | Fulfilled or rejected (can never change again) |

::: tip When to use
Every modern async API returns Promises: `fetch`, `navigator.clipboard`, `Notification.requestPermission`, `navigator.mediaDevices.getUserMedia`, most npm libraries.
:::

## Consuming and Chaining Promises

> `.then(callback)` runs when the promise is fulfilled and itself returns a **new promise**, so you can chain steps flatly instead of nesting.

```js
const getCountryData = (country) =>
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then((response) => response.json())          // .json() also returns a promise
    .then(([data]) => {
      renderCountry(data);
      const neighbour = data.borders?.[0];
      if (!neighbour) return;
      return fetch(`https://restcountries.com/v3.1/alpha/${neighbour}`);  // return to chain
    })
    .then((response) => response?.json())
    .then((data) => data && renderCountry(data[0], 'neighbour'));
```

::: warning Gotcha
Always **return** the inner promise from `.then`. If you write `.then(r => { fetch(...) })` without `return`, the next `.then` runs immediately with `undefined`.
:::

## Handling Rejected Promises

> `.catch(err)` handles any rejection earlier in the chain; `.finally()` runs whether it succeeded or failed.

```js
showSpinner();
fetch('/api/dashboard')
  .then((res) => res.json())
  .then(renderDashboard)
  .catch((err) => {
    console.error(err);
    renderError(`Something went wrong 💥 ${err.message}. Try again!`);
  })
  .finally(() => hideSpinner());          // always: success or failure
```

::: warning Gotcha
`fetch` only rejects on **network failure** (offline, DNS, CORS). A 404 or 500 is still a fulfilled promise with `res.ok === false`. You must check it yourself.
:::

## Throwing Errors Manually

> Inside `.then`, `throw new Error(...)` rejects the returned promise, so the chain jumps to the nearest `.catch`.

```js
const getJSON = (url, errorMsg = 'Something went wrong') =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${errorMsg} (${res.status})`);
    return res.json();
  });

getJSON('/api/countries/xx', 'Country not found')
  .then((data) => {
    if (!data.borders?.length) throw new Error('No neighbour found!');
    return getJSON(`/api/countries/${data.borders[0]}`);
  })
  .then(renderCountry)
  .catch((err) => renderError(err.message));   // 'Country not found (404)'
```

::: tip When to use
Wrap `fetch` once in a helper like `getJSON` that checks `res.ok`, parses JSON and throws meaningful errors. Every caller then gets consistent error handling.
:::
