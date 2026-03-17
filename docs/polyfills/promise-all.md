---
sidebar_position: 3
title: Promise.all
---

# Promise.all Polyfill

A custom implementation of `Promise.all` that resolves when **all** promises resolve, or rejects as soon as **any** one rejects.

## Implementation

```js
function Promiseall(promises) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            reject("give the array input");
            return;
        }

        let result = [],
            completed = 0,
            total = promises.length;

        if (total === 0) {
            resolve(result);
            return;
        }

        promises.forEach((promise, index) => {
            Promise.resolve(promise)
                .then((value) => {
                    result[index] = value;
                    completed++;
                    if (completed === total) {
                        resolve(result);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    });
}
```

## Usage

```js
const p1 = Promise.resolve(10);
const p2 = new Promise(res => setTimeout(() => res(20), 1000));
const p3 = 30; // non-promise value

Promiseall([p1, p2, p3])
    .then(console.log); // [10, 20, 30]
```

## Key Points

- Wraps each item with `Promise.resolve()` to handle non-promise values
- Uses an index-based approach to maintain the **order** of results
- A `completed` counter tracks when all promises have resolved
- Rejects immediately on the **first** rejection
