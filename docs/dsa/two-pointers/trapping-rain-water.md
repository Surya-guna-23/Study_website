---
sidebar_position: 5
title: Trapping Rain Water
---

# Trapping Rain Water

> **LeetCode 42** – [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)

## Problem Statement

Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `height = [0,1,0,2,1,0,1,3,2,1,2,1]` | `6` |
| 2 | `height = [4,2,0,3,2,5]` | `9` |

### Constraints

- `n == height.length`
- `1 <= n <= 2 * 10⁴`
- `0 <= height[i] <= 10⁵`

---

## Solution

**Approach:** Use two pointers (`i` from left, `j` from right) and track the running `left_max` and `right_max`. At each step, process the side with the smaller max — the water trapped at that position is `max - height[pointer]`. This works because the smaller side is the bottleneck.

- **Time Complexity:** $O(n)$ — single pass with two pointers.
- **Space Complexity:** $O(1)$ — only a few variables.

```js
/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function(height) {
        let i = 0;
        let left_max = height[0];
        let sum = 0;
        let j = height.length - 1;
        let right_max = height[j];
        while (i < j) {
            if (left_max <= right_max) {
                sum += left_max - height[i];
                i++;
                left_max = Math.max(left_max, height[i]);
            } else {
                sum += right_max - height[j];
                j--;
                right_max = Math.max(right_max, height[j]);
            }
        }
        return sum;
    }
```

---

## Dry Run

![Trapping Rain Water Dry Run](/img/dsa/trapping-rain-water-dry-run.svg)

**Example 2:** `height = [4, 2, 0, 3, 2, 5]`

Initial state: `i = 0`, `j = 5`, `left_max = 4`, `right_max = 5`, `sum = 0`

| Step | `left_max` | `right_max` | Side | Pointer | `height[ptr]` | Water added | `sum` | Move |
|------|-----------|------------|------|---------|---------------|-------------|-------|------|
| 1 | 4 | 5 | Left (`4 ≤ 5`) | `i=0` | 4 | `4 - 4 = 0` | 0 | `i++` → 1, `left_max = max(4,2) = 4` |
| 2 | 4 | 5 | Left (`4 ≤ 5`) | `i=1` | 2 | `4 - 2 = 2` | 2 | `i++` → 2, `left_max = max(4,0) = 4` |
| 3 | 4 | 5 | Left (`4 ≤ 5`) | `i=2` | 0 | `4 - 0 = 4` | 6 | `i++` → 3, `left_max = max(4,3) = 4` |
| 4 | 4 | 5 | Left (`4 ≤ 5`) | `i=3` | 3 | `4 - 3 = 1` | 7 | `i++` → 4, `left_max = max(4,2) = 4` |
| 5 | 4 | 5 | Left (`4 ≤ 5`) | `i=4` | 2 | `4 - 2 = 2` | 9 | `i++` → 5, `left_max = max(4,5) = 5` |
| — | — | — | — | — | — | — | — | `i < j` false → exit |

**Result:** `9` ✅

---

## Visual

```
height = [4, 2, 0, 3, 2, 5]

     5
 4   ██
 ██~~██
 ██~~██~~██
 ██████~~██
 ██████████

 ~~ = trapped water
```

---

## Test Cases

```js
console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trap([4, 2, 0, 3, 2, 5]));                      // 9
console.log(trap([1, 0, 1]));                                // 1
console.log(trap([3, 0, 0, 2, 0, 4]));                      // 10
console.log(trap([0, 0, 0]));                                // 0
console.log(trap([5]));                                      // 0
```
