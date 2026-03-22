---
sidebar_position: 1
title: Binary Search
---

# Binary Search

> **LeetCode 704** – [Binary Search](https://leetcode.com/problems/binary-search/) | **Striver (TUF)** – [Binary Search Article](https://takeuforward.org/data-structure/binary-search-explained/)

## Problem Statement

Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index. Otherwise, return `-1`.

You must write an algorithm with $O(\log n)$ runtime complexity.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `nums = [-1,0,3,5,9,12]`, `target = 9` | `4` |
| 2 | `nums = [-1,0,3,5,9,12]`, `target = 2` | `-1` |

### Constraints

- `1 <= nums.length <= 10⁴`
- `-10⁴ < nums[i], target < 10⁴`
- All the integers in `nums` are **unique**.
- `nums` is sorted in ascending order.

---

## Solution

**Approach — Recursive Binary Search:**
Split the array in half at every step. Compare the middle element with the target:
- If it matches, return the index.
- If the target is greater, recurse on the **right half**.
- Otherwise, recurse on the **left half**.

- **Time Complexity:** $O(\log n)$ — the search space is halved each time.
- **Space Complexity:** $O(\log n)$ — recursion stack depth.

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    let low = 0, high = nums.length - 1;
    return helper(nums, low, high, target);
};

function helper(nums, low, high, target) {
    if (low > high) {
        return -1;
    }
    let mid = Math.ceil((low + high) / 2);
    if (nums[mid] === target) return mid;
    else if (target > nums[mid]) {
        return helper(nums, mid + 1, high, target);
    }
    return helper(nums, low, mid - 1, target);
}
```

---

## Dry Run

![Binary Search Step 1](/img/dsa/binary-search-dry-run-1.svg)

![Binary Search Step 2](/img/dsa/binary-search-dry-run-2.svg)

![Binary Search Step 3](/img/dsa/binary-search-dry-run-3.svg)

Let's walk through **Example 1**: `nums = [-1, 0, 3, 5, 9, 12]`, `target = 9`

### Call 1 — `helper(nums, 0, 5, 9)`

| Variable | Value |
|----------|-------|
| `low` | `0` |
| `high` | `5` |
| `mid` | `Math.ceil((0+5)/2) = 3` |
| `nums[3]` | `5` |

`9 > 5` → target is in the **right half** → recurse with `helper(nums, 4, 5, 9)`

### Call 2 — `helper(nums, 4, 5, 9)`

| Variable | Value |
|----------|-------|
| `low` | `4` |
| `high` | `5` |
| `mid` | `Math.ceil((4+5)/2) = 5` |
| `nums[5]` | `12` |

`9 < 12` → target is in the **left half** → recurse with `helper(nums, 4, 4, 9)`

### Call 3 — `helper(nums, 4, 4, 9)`

| Variable | Value |
|----------|-------|
| `low` | `4` |
| `high` | `4` |
| `mid` | `Math.ceil((4+4)/2) = 4` |
| `nums[4]` | `9` |

`nums[4] === 9` → **Return `4`** ✅

### Summary Table

| Call | `low` | `high` | `mid` | `nums[mid]` | Decision |
|------|-------|--------|-------|-------------|----------|
| 1 | 0 | 5 | 3 | 5 | `9 > 5` → go right |
| 2 | 4 | 5 | 5 | 12 | `9 < 12` → go left |
| 3 | 4 | 4 | 4 | 9 | **Match → return 4** ✅ |

---

## Test Cases

```js
console.log(search([-1, 0, 3, 5, 9, 12], 9));   // 4
console.log(search([-1, 0, 3, 5, 9, 12], 2));   // -1
console.log(search([5], 5));                      // 0  (single element, found)
console.log(search([5], -5));                     // -1 (single element, not found)
console.log(search([2, 5], 5));                   // 1  (two elements, target at end)
```
