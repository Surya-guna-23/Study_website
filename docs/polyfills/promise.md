---
sidebar_position: 2
title: Promise
---

# Promise Polyfill

A custom implementation of the JavaScript `Promise` constructor using a simple function-based approach.

## Implementation

```js
function mypromise(executor) {
    let onresolve, onrejected;
    let isfulfilled = false;
    let isrejected = false;
    let iscalled = false;
    let value;

    function resolve(val) {
        isfulfilled = true;
        value = val;

        if (typeof onresolve === "function" && !iscalled) {
            iscalled = true;
            onresolve(value);
        }
    }

    function reject(val) {
        isrejected = true;
        value = val;

        if (typeof onrejected === "function" && !iscalled) {
            iscalled = true;
            onrejected(value);
        }
    }

    this.then = function (callback) {
        onresolve = callback;

        if (isfulfilled && !iscalled) {
            iscalled = true;
            onresolve(value);
        }
        return this;
    };

    this.catch = function (callback) {
        onrejected = callback;

        if (isrejected && !iscalled) {
            iscalled = true;
            onrejected(value);
        }
        return this;
    };

    executor(resolve, reject);
}
```

## Usage

```js
const example = new mypromise((resolve, reject) => {
    setTimeout(() => { resolve(3) }, 1000);
});

example.then((res) => console.log(res)); // 3
```

## Key Points

- Tracks fulfillment/rejection state with boolean flags
- `iscalled` ensures the callback is invoked only once
- `.then()` and `.catch()` return `this` for basic chaining
- If the promise resolves **before** `.then()` is called, the callback is still executed
