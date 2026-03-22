---
sidebar_position: 4
title: Container With Most Water
---

# Container With Most Water

> **LeetCode 11** – [Container With Most Water](https://leetcode.com/problems/container-with-most-water/) | **Striver (TUF)** – [Container With Most Water Article](https://takeuforward.org/data-structure/container-with-most-water/)

## Problem Statement

You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `iᵗʰ` line are `(i, 0)` and `(i, height[i])`.

Find two lines that together with the x-axis form a container, such that the container contains the **most water**.

Return the **maximum amount of water** a container can store.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `height = [1,8,6,2,5,4,8,3,7]` | `49` |
| 2 | `height = [1,1]` | `1` |

### Constraints

- `n == height.length`
- `2 <= n <= 10⁵`
- `0 <= height[i] <= 10⁴`

---

## Solution

**Approach:** Use two pointers starting at both ends. Calculate the area as `min(height[l], height[r]) * (r - l)`. Move the pointer with the smaller height inward — keeping the taller line gives a better chance of finding a larger area.

- **Time Complexity:** $O(n)$ — single pass with two pointers.
- **Space Complexity:** $O(1)$ — only a few variables.

```js
/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
    let l=0
    let r=height.length-1
    let total=0
    while(l<r)
    {
        let h=Math.min(height[r],height[l])
        let b= r-l
        total= Math.max(total,h*b)
        if(height[r]>height[l])
        {
            l++
        }
        else{
            r--
        }
    }
    return total
};
```

---

## Dry Run

![Container With Most Water Dry Run](/img/dsa/container-with-most-water-dry-run.svg)

**Example 1:** `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]`

| Step | `l` | `r` | `height[l]` | `height[r]` | `h` (min) | `b` (width) | Area | `total` | Move |
|------|-----|-----|-------------|-------------|-----------|-------------|------|---------|------|
| 1 | 0 | 8 | 1 | 7 | 1 | 8 | 8 | 8 | `l++` (1 < 7) |
| 2 | 1 | 8 | 8 | 7 | 7 | 7 | **49** | **49** | `r--` (7 ≤ 8) |
| 3 | 1 | 7 | 8 | 3 | 3 | 6 | 18 | 49 | `r--` (3 ≤ 8) |
| 4 | 1 | 6 | 8 | 8 | 8 | 5 | 40 | 49 | `r--` (8 ≤ 8) |
| 5 | 1 | 5 | 8 | 4 | 4 | 4 | 16 | 49 | `r--` (4 ≤ 8) |
| 6 | 1 | 4 | 8 | 5 | 5 | 3 | 15 | 49 | `r--` (5 ≤ 8) |
| 7 | 1 | 3 | 8 | 2 | 2 | 2 | 4 | 49 | `r--` (2 ≤ 8) |
| 8 | 1 | 2 | 8 | 6 | 6 | 1 | 6 | 49 | `r--` (6 ≤ 8) |
| — | 1 | 1 | — | — | — | — | — | — | `l < r` false → exit |

**Result:** `49` ✅ (formed between indices 1 and 8 → height `min(8,7) * 7 = 49`)

---

## Test Cases

```js
console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
console.log(maxArea([1, 1]));                         // 1
console.log(maxArea([4, 3, 2, 1, 4]));                // 16
console.log(maxArea([1, 2, 1]));                      // 2
console.log(maxArea([2, 3, 10, 5, 7, 8, 9]));         // 36
```
