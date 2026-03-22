---
sidebar_position: 4
title: Search in Rotated Sorted Array
---

# Search in Rotated Sorted Array

> **LeetCode 33** – [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) | **Striver (TUF)** – [Search in Rotated Sorted Array Article](https://takeuforward.org/data-structure/search-element-in-a-rotated-sorted-array/)

## Problem Statement

There is an integer array `nums` sorted in ascending order (with **distinct** values). Prior to being passed to your function, `nums` is possibly **rotated** at an unknown pivot index.

Given the array `nums` after the possible rotation and an integer `target`, return the **index** of `target` if it is in `nums`, or `-1` if it is not.

You must write an algorithm with $O(\log n)$ runtime complexity.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `nums = [4,5,6,7,0,1,2]`, `target = 0` | `4` |
| 2 | `nums = [4,5,6,7,0,1,2]`, `target = 3` | `-1` |
| 3 | `nums = [1]`, `target = 0` | `-1` |

### Constraints

- `1 <= nums.length <= 5000`
- `-10⁴ <= nums[i] <= 10⁴`
- All values are **unique**.
- `nums` is an ascending array that is possibly rotated.

---

## Solution

**Approach — Modified Binary Search:**
At every step, **one half** of the array is guaranteed to be sorted. We identify which half is sorted and check if the target lies within that sorted range:

1. If **left half is sorted** (`nums[low] <= nums[mid]`):
   - If `target` falls in `[nums[low], nums[mid]]` → search left.
   - Otherwise → search right.
2. If **right half is sorted**:
   - If `target` falls in `[nums[mid], nums[high]]` → search right.
   - Otherwise → search left.

- **Time Complexity:** $O(\log n)$
- **Space Complexity:** $O(1)$

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    let low = 0, high = nums.length - 1;
    while (low <= high) {
        let mid = Math.ceil((low + high) / 2);
        if (nums[mid] === target) return mid;

        // Left half is sorted
        if (nums[low] <= nums[mid]) {
            if (nums[low] <= target && target <= nums[mid]) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        // Right half is sorted
        else {
            if (nums[mid] <= target && target <= nums[high]) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
    }
    return -1;
};
```

---

## Dry Run

![Search in Rotated Sorted Array Step 1](/img/dsa/search-in-rotated-sorted-array-dry-run-1.svg)

![Search in Rotated Sorted Array Step 2](/img/dsa/search-in-rotated-sorted-array-dry-run-2.svg)

![Search in Rotated Sorted Array Step 3](/img/dsa/search-in-rotated-sorted-array-dry-run-3.svg)

Let's walk through **Example 1**: `nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0`

```
Index:  0   1   2   3   4   5   6
Value: [4,  5,  6,  7,  0,  1,  2]
```

**Initial state:** `low = 0`, `high = 6`

### Iteration 1

| Variable | Value |
|----------|-------|
| `mid` | `Math.ceil((0+6)/2) = 3` |
| `nums[mid]` | `7` |
| `nums[low]=nums[0]` | `4` |
| `nums[high]=nums[6]` | `2` |

`nums[3] (7) ≠ 0` → not found yet.

`nums[0] (4) <= nums[3] (7)` → **left half `[4,5,6,7]` is sorted**.

Is `4 <= 0 <= 7`? **No** → target is **not** in the sorted left half.
→ `low = mid + 1 = 4`

```
Searching:          [0,  1,  2]   ← right half
```

### Iteration 2

| Variable | Value |
|----------|-------|
| `low` | `4` |
| `high` | `6` |
| `mid` | `Math.ceil((4+6)/2) = 5` |
| `nums[5]` | `1` |

`nums[5] (1) ≠ 0` → not found yet.

`nums[4] (0) <= nums[5] (1)` → **left half `[0,1]` is sorted**.

Is `0 <= 0 <= 1`? **Yes** → target is in the sorted left half.
→ `high = mid - 1 = 4`

```
Searching:          [0]   ← narrowed down
```

### Iteration 3

| Variable | Value |
|----------|-------|
| `low` | `4` |
| `high` | `4` |
| `mid` | `Math.ceil((4+4)/2) = 4` |
| `nums[4]` | `0` |

`nums[4] (0) === target (0)` → **Return `4`** ✅

### Summary Table

| Iteration | `low` | `high` | `mid` | `nums[mid]` | Sorted Half | Target in Range? | Action |
|-----------|-------|--------|-------|-------------|-------------|------------------|--------|
| 1 | 0 | 6 | 3 | 7 | Left `[4,5,6,7]` | No (`0 ∉ [4,7]`) | `low = 4` |
| 2 | 4 | 6 | 5 | 1 | Left `[0,1]` | Yes (`0 ∈ [0,1]`) | `high = 4` |
| 3 | 4 | 4 | 4 | **0** | — | **Match!** | **Return 4** ✅ |

---

### Dry Run: Example 2 — `nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 3`

| Iteration | `low` | `high` | `mid` | `nums[mid]` | Sorted Half | Target in Range? | Action |
|-----------|-------|--------|-------|-------------|-------------|------------------|--------|
| 1 | 0 | 6 | 3 | 7 | Left `[4,5,6,7]` | No (`3 < 4`) | `low = 4` |
| 2 | 4 | 6 | 5 | 1 | Left `[0,1]` | No (`3 > 1`) | `low = 6` |
| 3 | 6 | 6 | 6 | 2 | Left `[2]` | No (`3 > 2`) | `low = 7` |
| 4 | 7 | 6 | — | — | — | — | **Exit → return -1** ✅ |

---

## Test Cases

```js
console.log(search([4, 5, 6, 7, 0, 1, 2], 0));   // 4
console.log(search([4, 5, 6, 7, 0, 1, 2], 3));   // -1
console.log(search([1], 0));                       // -1
console.log(search([1], 1));                       // 0
console.log(search([3, 1], 1));                    // 1
console.log(search([5, 1, 3], 3));                 // 2
```
