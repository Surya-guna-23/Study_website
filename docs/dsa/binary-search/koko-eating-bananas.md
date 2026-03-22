---
sidebar_position: 2
title: Koko Eating Bananas
---

# Koko Eating Bananas

> **LeetCode 875** – [Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/) | **Striver (TUF)** – [Koko Eating Bananas Article](https://takeuforward.org/binary-search/koko-eating-bananas/)

## Problem Statement

Koko loves to eat bananas. There are `n` piles of bananas, the `i`-th pile has `piles[i]` bananas. The guards have gone and will come back in `h` hours.

Koko can decide her bananas-per-hour eating speed of `k`. Each hour, she chooses some pile and eats `k` bananas from that pile. If the pile has fewer than `k` bananas, she eats all of them and won't eat any more bananas during that hour.

Return the **minimum** integer `k` such that she can eat all the bananas within `h` hours.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `piles = [3,6,7,11]`, `h = 8` | `4` |
| 2 | `piles = [30,11,23,4,20]`, `h = 5` | `30` |
| 3 | `piles = [30,11,23,4,20]`, `h = 6` | `23` |

### Constraints

- `1 <= piles.length <= 10⁴`
- `piles.length <= h <= 10⁹`
- `1 <= piles[i] <= 10⁹`

---

## Solution

**Approach — Binary Search on Answer:**
The eating speed `k` ranges from `1` to `max(piles)`. We binary search for the **smallest** `k` where the total hours needed ≤ `h`.

For a given speed `k`, the hours required for pile `piles[i]` is `⌈piles[i] / k⌉`. Sum these up across all piles.

- **Time Complexity:** $O(n \cdot \log(\max(piles)))$ — binary search range is `max(piles)`, and each check iterates all piles.
- **Space Complexity:** $O(1)$

```js
/**
 * @param {number[]} piles
 * @param {number} h
 * @return {number}
 */
var minEatingSpeed = function(piles, h) {
    let low = 1, high = Math.max(...piles), min = Infinity;

    while (low <= high) {
        let mid = Math.ceil((low + high) / 2);
        let totalhours = check(piles, mid);
        if (totalhours <= h) {
            min = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return low;
};

function check(piles, k) {
    let total = 0;
    for (let i = 0; i < piles.length; i++) {
        total += Math.ceil(piles[i] / k);
    }
    return total;
}
```

---

## Dry Run

![Koko Eating Bananas Step 1](/img/dsa/koko-eating-bananas-dry-run-1.svg)

![Koko Eating Bananas Step 2](/img/dsa/koko-eating-bananas-dry-run-2.svg)

![Koko Eating Bananas Step 3](/img/dsa/koko-eating-bananas-dry-run-3.svg)

![Koko Eating Bananas Step 4](/img/dsa/koko-eating-bananas-dry-run-4.svg)

Let's walk through **Example 1**: `piles = [3, 6, 7, 11]`, `h = 8`

**Initial state:** `low = 1`, `high = 11` (max pile), `min = Infinity`

### Iteration 1

| Variable | Value |
|----------|-------|
| `mid` | `Math.ceil((1+11)/2) = 6` |
| `check([3,6,7,11], 6)` | `⌈3/6⌉ + ⌈6/6⌉ + ⌈7/6⌉ + ⌈11/6⌉ = 1 + 1 + 2 + 2 = 6` |

`6 ≤ 8` → feasible! `min = 6`, `high = 5`

### Iteration 2

| Variable | Value |
|----------|-------|
| `mid` | `Math.ceil((1+5)/2) = 3` |
| `check([3,6,7,11], 3)` | `⌈3/3⌉ + ⌈6/3⌉ + ⌈7/3⌉ + ⌈11/3⌉ = 1 + 2 + 3 + 4 = 10` |

`10 > 8` → too slow! `low = 4`

### Iteration 3

| Variable | Value |
|----------|-------|
| `mid` | `Math.ceil((4+5)/2) = 5` |
| `check([3,6,7,11], 5)` | `⌈3/5⌉ + ⌈6/5⌉ + ⌈7/5⌉ + ⌈11/5⌉ = 1 + 2 + 2 + 3 = 8` |

`8 ≤ 8` → feasible! `min = 5`, `high = 4`

### Iteration 4

| Variable | Value |
|----------|-------|
| `mid` | `Math.ceil((4+4)/2) = 4` |
| `check([3,6,7,11], 4)` | `⌈3/4⌉ + ⌈6/4⌉ + ⌈7/4⌉ + ⌈11/4⌉ = 1 + 2 + 2 + 3 = 8` |

`8 ≤ 8` → feasible! `min = 4`, `high = 3`

### Iteration 5

`low (4) > high (3)` → loop ends.

**Return `low = 4`** ✅

### Summary Table

| Iteration | `low` | `high` | `mid` | Total Hours | `≤ h`? | Action |
|-----------|-------|--------|-------|-------------|--------|--------|
| 1 | 1 | 11 | 6 | 6 | ✅ | `min=6`, `high=5` |
| 2 | 1 | 5 | 3 | 10 | ❌ | `low=4` |
| 3 | 4 | 5 | 5 | 8 | ✅ | `min=5`, `high=4` |
| 4 | 4 | 4 | 4 | 8 | ✅ | `min=4`, `high=3` |
| 5 | 4 | 3 | — | — | — | **Exit → return 4** ✅ |

---

## Test Cases

```js
console.log(minEatingSpeed([3, 6, 7, 11], 8));          // 4
console.log(minEatingSpeed([30, 11, 23, 4, 20], 5));    // 30
console.log(minEatingSpeed([30, 11, 23, 4, 20], 6));    // 23
console.log(minEatingSpeed([1], 1));                      // 1  (single pile)
console.log(minEatingSpeed([1000000000], 2));             // 500000000
```
