---
sidebar_position: 5
title: Cancellable Promise
---

# Cancellable Promise

A wrapper around the native `Promise` that adds the ability to **cancel** a pending promise, preventing its callbacks from firing.

## Implementation

```js
function cancellablePromise(executor) {
    let isCancelled = false;

    const promise = new Promise((resolve, reject) => {
        executor(
            (value) => {
                if (!isCancelled) resolve(value);
            },
            (error) => {
                if (!isCancelled) reject(error);
            }
        );
    });

    return {
        promise,
        cancel() {
            isCancelled = true;
        }
    };
}
```

## Usage

```js
const { promise, cancel } = cancellablePromise((resolve, reject) => {
    setTimeout(() => resolve("Done!"), 2000);
});

promise.then(console.log).catch(console.error);

// Cancel before it resolves
setTimeout(() => cancel(), 1000);
// Nothing is logged — the promise never settles
```

## Key Points

- Uses a closure (`isCancelled` flag) to gate `resolve` and `reject`
- Calling `cancel()` prevents the promise from ever settling
- The promise stays **pending forever** after cancellation — it doesn't reject
- Useful for cancelling network requests, timers, or other async work on component unmount
