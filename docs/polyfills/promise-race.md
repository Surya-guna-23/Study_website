---
sidebar_position: 4
title: Promise.race
---

# Promise.race Polyfill

A custom implementation of `Promise.race` that resolves or rejects as soon as the **first** promise settles.

## Implementation

```js
function Promiserace(promises) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            reject("give the array correctly");
            return;
        }

        for (const p of promises) {
            Promise.resolve(p)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        }
    });
}
```

## Usage

```js
const p1 = Promise.resolve(10);
const p2 = new Promise(res => setTimeout(() => res(20), 1000));
const p3 = 30; // non-promise value

Promiserace([p1, p2, p3])
    .then(console.log)
    .catch(console.error);
```

## Key Points

- The first promise to settle (resolve or reject) wins
- Subsequent settlements are ignored because a `Promise` can only settle once
- Non-promise values are wrapped with `Promise.resolve()` and settle immediately
