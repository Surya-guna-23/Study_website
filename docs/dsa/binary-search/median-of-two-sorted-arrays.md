---
sidebar_position: 5
title: Median of Two Sorted Arrays
---

# Median of Two Sorted Arrays

> **LeetCode 4** – [Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/) | **Striver (TUF)** – [Median of Two Sorted Arrays Article](https://takeuforward.org/data-structure/median-of-two-sorted-arrays-of-different-sizes/)

## Problem Statement

Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return **the median** of the two sorted arrays.

The overall run time complexity should be $O(\log(\min(m, n)))$.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `nums1 = [1,3]`, `nums2 = [2]` | `2.0` |
| 2 | `nums1 = [1,2]`, `nums2 = [3,4]` | `2.5` |

### Constraints

- `nums1.length == m`, `nums2.length == n`
- `0 <= m <= 1000`, `0 <= n <= 1000`
- `1 <= m + n <= 2000`
- `-10⁶ <= nums1[i], nums2[i] <= 10⁶`

---

## Solution

**Approach — Binary Search on the Smaller Array:**

The idea is to **partition** both arrays such that all elements in the left partition ≤ all elements in the right partition, and the left partition contains exactly `⌊(m+n+1)/2⌋` elements.

1. Always binary search on the **smaller** array to ensure $O(\log(\min(m,n)))$.
2. For a partition `mid1` in `nums1`, compute `mid2 = left - mid1` for `nums2`.
3. Check the cross-boundary condition: `l1 ≤ r2` **and** `l2 ≤ r1`.
   - If valid: we've found the correct partition.
   - If `l1 > r2`: too many from `nums1` → move left (`high = mid1 - 1`).
   - If `l2 > r1`: too few from `nums1` → move right (`low = mid1 + 1`).
4. For **odd** total length, median = `max(l1, l2)`.
   For **even** total length, median = `(max(l1, l2) + min(r1, r2)) / 2`.

- **Time Complexity:** $O(\log(\min(m, n)))$
- **Space Complexity:** $O(1)$

```js
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function(nums1, nums2) {
    let n1 = nums1.length;
    let n2 = nums2.length;
    // Ensure we binary search on the smaller array
    if (n1 > n2) {
        return findMedianSortedArrays(nums2, nums1);
    }
    let n = n1 + n2;
    let left = Math.floor((n1 + n2 + 1) / 2); // size of left partition
    let low = 0, high = n1;

    while (low <= high) {
        let mid1 = Math.floor((low + high) / 2);
        let mid2 = left - mid1;

        let l1 = -Infinity, l2 = -Infinity;
        let r1 = Infinity, r2 = Infinity;

        if (mid1 < n1) r1 = nums1[mid1];
        if (mid2 < n2) r2 = nums2[mid2];
        if (mid1 - 1 >= 0) l1 = nums1[mid1 - 1];
        if (mid2 - 1 >= 0) l2 = nums2[mid2 - 1];

        if (l1 <= r2 && l2 <= r1) {
            if (n % 2 === 1) {
                return Math.max(l1, l2);
            }
            return (Math.max(l1, l2) + Math.min(r1, r2)) / 2;
        } else if (l1 > r2) {
            high = mid1 - 1;
        } else {
            low = mid1 + 1;
        }
    }
    return 0;
};
```

---

## Dry Run

![Median of Two Sorted Arrays Step 1](/img/dsa/median-of-two-sorted-arrays-dry-run-1.svg)

![Median of Two Sorted Arrays Step 2](/img/dsa/median-of-two-sorted-arrays-dry-run-2.svg)

Let's walk through **Example 2**: `nums1 = [1, 2]`, `nums2 = [3, 4]`

**Setup:**
- `n1 = 2`, `n2 = 2` → `n1 ≤ n2`, so we binary search on `nums1`.
- `n = 4` (even → median is average of two middle elements).
- `left = ⌊(2+2+1)/2⌋ = 2` — the left partition must hold **2** elements.
- `low = 0`, `high = 2`

```
nums1:  [1, 2]
nums2:  [3, 4]
```

### Iteration 1

| Variable | Value |
|----------|-------|
| `mid1` | `⌊(0+2)/2⌋ = 1` |
| `mid2` | `left - mid1 = 2 - 1 = 1` |

**Partition:**

| | Left | Right |
|-------|------|-------|
| `nums1` | `[1]` | `[2]` |
| `nums2` | `[3]` | `[4]` |

| Boundary | Value |
|----------|-------|
| `l1 = nums1[0]` | `1` |
| `r1 = nums1[1]` | `2` |
| `l2 = nums2[0]` | `3` |
| `r2 = nums2[1]` | `4` |

**Check:** `l1 (1) ≤ r2 (4)` ✅ **AND** `l2 (3) ≤ r1 (2)` ❌

`l2 > r1` → too few elements from `nums1` → `low = mid1 + 1 = 2`

### Iteration 2

| Variable | Value |
|----------|-------|
| `mid1` | `⌊(2+2)/2⌋ = 2` |
| `mid2` | `left - mid1 = 2 - 2 = 0` |

**Partition:**

| | Left | Right |
|-------|------|-------|
| `nums1` | `[1, 2]` | `[]` |
| `nums2` | `[]` | `[3, 4]` |

| Boundary | Value |
|----------|-------|
| `l1 = nums1[1]` | `2` |
| `r1` | `Infinity` (mid1 = n1, no right element) |
| `l2` | `-Infinity` (mid2 = 0, no left element) |
| `r2 = nums2[0]` | `3` |

**Check:** `l1 (2) ≤ r2 (3)` ✅ **AND** `l2 (-∞) ≤ r1 (∞)` ✅ → **Valid partition!**

`n = 4` is **even**, so:

$$\text{median} = \frac{\max(l1, l2) + \min(r1, r2)}{2} = \frac{\max(2, -\infty) + \min(\infty, 3)}{2} = \frac{2 + 3}{2} = 2.5$$

**Return `2.5`** ✅

### Summary Table

| Iteration | `low` | `high` | `mid1` | `mid2` | `l1` | `r1` | `l2` | `r2` | Valid? | Action |
|-----------|-------|--------|--------|--------|------|------|------|------|--------|--------|
| 1 | 0 | 2 | 1 | 1 | 1 | 2 | 3 | 4 | ❌ (`l2>r1`) | `low = 2` |
| 2 | 2 | 2 | 2 | 0 | 2 | ∞ | -∞ | 3 | ✅ | **Return 2.5** ✅ |

---

### Dry Run: Example 1 — `nums1 = [1, 3]`, `nums2 = [2]`

**Setup:** `n1 = 2`, `n2 = 1`, `n = 3` (odd), `left = 2`, `low = 0`, `high = 1`

(We search on `nums2` since it's smaller — swap so `nums1 = [2]`, `nums2 = [1, 3]`)

`n1 = 1`, `n2 = 2`, `left = 2`, `low = 0`, `high = 1`

| Iteration | `mid1` | `mid2` | `l1` | `r1` | `l2` | `r2` | Valid? | Action |
|-----------|--------|--------|------|------|------|------|--------|--------|
| 1 | 0 | 2 | -∞ | 2 | 3 | ∞ | ❌ (`l2 (3) > r1 (2)`) | `low = 1` |
| 2 | 1 | 1 | 2 | ∞ | 1 | 3 | ✅ | odd → `max(2,1) = 2` |

**Return `2`** ✅

---

## Test Cases

```js
console.log(findMedianSortedArrays([1, 3], [2]));          // 2.0
console.log(findMedianSortedArrays([1, 2], [3, 4]));       // 2.5
console.log(findMedianSortedArrays([], [1]));               // 1.0
console.log(findMedianSortedArrays([2], []));               // 2.0
console.log(findMedianSortedArrays([1, 3], [2, 4, 5]));    // 3.0
console.log(findMedianSortedArrays([1, 2, 3], [4, 5, 6])); // 3.5
```
