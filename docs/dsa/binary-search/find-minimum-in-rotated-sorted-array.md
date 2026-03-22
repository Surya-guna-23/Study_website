---
sidebar_position: 3
title: Find Minimum in Rotated Sorted Array
---

# Find Minimum in Rotated Sorted Array

> **LeetCode 153** – [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) | **Striver (TUF)** – [Minimum in Rotated Sorted Array Article](https://takeuforward.org/data-structure/minimum-in-rotated-sorted-array/)

## Problem Statement

Suppose an array of length `n` sorted in ascending order is **rotated** between `1` and `n` times. For example, the array `nums = [0,1,2,4,5,6,7]` might become:

- `[4,5,6,7,0,1,2]` if it was rotated 4 times.
- `[0,1,2,4,5,6,7]` if it was rotated 7 times.

Given the sorted rotated array `nums` of **unique** elements, return the **minimum** element of this array.

You must write an algorithm that runs in $O(\log n)$ time.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `nums = [3,4,5,1,2]` | `1` |
| 2 | `nums = [4,5,6,7,0,1,2]` | `0` |
| 3 | `nums = [11,13,15,17]` | `11` |

### Constraints

- `n == nums.length`
- `1 <= n <= 5000`
- `-5000 <= nums[i] <= 5000`
- All values are **unique**.

---

## Solution

**Approach — Modified Binary Search:**
In a rotated sorted array, one half is always sorted. We use this property:

1. If `nums[low] <= nums[high]`, the sub-array is fully sorted — `nums[low]` is the minimum. Break early.
2. If the **left half** is sorted (`nums[low] <= nums[mid]`), the minimum can't be in the sorted left half (except `nums[low]` itself). Record `nums[low]` and search the right half.
3. Otherwise the **right half** is sorted, so the minimum could be `nums[mid]`. Record it and search the left half.

- **Time Complexity:** $O(\log n)$ — binary search.
- **Space Complexity:** $O(1)$

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var findMin = function(nums) {
    let low = 0, high = nums.length - 1, mid;
    let ans = Infinity;
    while (low <= high) {
        mid = Math.ceil((low + high) / 2);
        // If sub-array is already sorted
        if (nums[low] <= nums[high]) {
            ans = Math.min(ans, nums[low]);
            break;
        }
        // Left half is sorted
        if (nums[low] <= nums[mid]) {
            ans = Math.min(ans, nums[low]);
            low = mid + 1;
        }
        // Right half is sorted
        else {
            ans = Math.min(ans, nums[mid]);
            high = mid - 1;
        }
    }
    return ans;
};
```

---

## Dry Run

![Find Minimum in Rotated Sorted Array Step 1](/img/dsa/find-minimum-in-rotated-sorted-array-dry-run-1.svg)

![Find Minimum in Rotated Sorted Array Step 2](/img/dsa/find-minimum-in-rotated-sorted-array-dry-run-2.svg)

Let's walk through **Example 1**: `nums = [3, 4, 5, 1, 2]`

**Initial state:** `low = 0`, `high = 4`, `ans = Infinity`

```
Index:  0   1   2   3   4
Value: [3,  4,  5,  1,  2]
```

### Iteration 1

| Variable | Value |
|----------|-------|
| `mid` | `Math.ceil((0+4)/2) = 2` |
| `nums[low]=nums[0]` | `3` |
| `nums[high]=nums[4]` | `2` |
| `nums[mid]=nums[2]` | `5` |

`nums[0] (3) > nums[4] (2)` → **not fully sorted**, skip early break.

`nums[0] (3) <= nums[2] (5)` → **left half `[3,4,5]` is sorted**.
- `ans = Math.min(Infinity, 3) = 3`
- `low = mid + 1 = 3`

```
Searching:       [1,  2]   ← right half
```

### Iteration 2

| Variable | Value |
|----------|-------|
| `low` | `3` |
| `high` | `4` |
| `mid` | `Math.ceil((3+4)/2) = 4` |
| `nums[3]` | `1` |
| `nums[4]` | `2` |
| `nums[4]` | `2` |

`nums[3] (1) <= nums[4] (2)` → **sub-array is fully sorted**.
- `ans = Math.min(3, 1) = 1`
- **Break!**

**Return `ans = 1`** ✅

### Summary Table

| Iteration | `low` | `high` | `mid` | `nums[mid]` | Sorted? | `ans` | Action |
|-----------|-------|--------|-------|-------------|---------|-------|--------|
| 1 | 0 | 4 | 2 | 5 | Left sorted | 3 | `low = 3` |
| 2 | 3 | 4 | 4 | 2 | Fully sorted | **1** | **Break** ✅ |

---

### Dry Run: Example 2 — `nums = [4, 5, 6, 7, 0, 1, 2]`

```
Index:  0   1   2   3   4   5   6
Value: [4,  5,  6,  7,  0,  1,  2]
```

**Initial:** `low = 0`, `high = 6`, `ans = Infinity`

| Iteration | `low` | `high` | `mid` | `nums[mid]` | Check | `ans` | Action |
|-----------|-------|--------|-------|-------------|-------|-------|--------|
| 1 | 0 | 6 | 3 | 7 | `nums[0](4) <= nums[3](7)` → left sorted | 4 | `low = 4` |
| 2 | 4 | 6 | 5 | 1 | `nums[4](0) <= nums[6](2)` → fully sorted | **0** | **Break** ✅ |

**Return `0`** ✅

---

## Test Cases

```js
console.log(findMin([3, 4, 5, 1, 2]));         // 1
console.log(findMin([4, 5, 6, 7, 0, 1, 2]));   // 0
console.log(findMin([11, 13, 15, 17]));         // 11 (not rotated)
console.log(findMin([2, 1]));                    // 1
console.log(findMin([1]));                       // 1  (single element)
```
