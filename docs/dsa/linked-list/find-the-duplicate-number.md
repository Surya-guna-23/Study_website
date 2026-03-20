---
sidebar_position: 7
title: Find the Duplicate Number
---

# Find the Duplicate Number

> **LeetCode 287** – [Find the Duplicate Number](https://leetcode.com/problems/find-the-duplicate-number/)

## Problem Statement

Given an array of integers `nums` containing `n + 1` integers where each integer is in the range `[1, n]` inclusive, there is **only one repeated number**. Return this repeated number.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `nums = [1,3,4,2,2]` | `2` |
| 2 | `nums = [3,1,3,4,2]` | `3` |
| 3 | `nums = [3,3,3,3,3]` | `3` |

### Constraints

- `1 <= n <= 10⁵`
- `nums.length == n + 1`
- `1 <= nums[i] <= n`

---

## Solution

**Approach:** Use a `Set` to track numbers seen so far. The first number that already exists in the set is the duplicate.

- **Time Complexity:** $O(n)$ — single pass.
- **Space Complexity:** $O(n)$ — the set.

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var findDuplicate = function(nums) {
    let res= new Set()
    for(let i=0;i<nums.length;i++)
    {
        if(res.has(nums[i]))
        {
            return nums[i]
        }
        else{
            res.add(nums[i])
        }
    }
};
```

---

## Dry Run

![Find The Duplicate Number Dry Run](/img/dsa/find-the-duplicate-number-dry-run.svg)

**Example 1:** `nums = [1, 3, 4, 2, 2]`

| Step | `i` | `nums[i]` | `res.has(nums[i])?` | `res` (after) | Action |
|------|-----|-----------|---------------------|---------------|--------|
| 1 | 0 | 1 | No | `{1}` | Add `1` |
| 2 | 1 | 3 | No | `{1, 3}` | Add `3` |
| 3 | 2 | 4 | No | `{1, 3, 4}` | Add `4` |
| 4 | 3 | 2 | No | `{1, 3, 4, 2}` | Add `2` |
| 5 | 4 | 2 | **Yes** | — | **Return `2`** ✅ |

---

## Test Cases

```js
console.log(findDuplicate([1, 3, 4, 2, 2])); // 2
console.log(findDuplicate([3, 1, 3, 4, 2])); // 3
console.log(findDuplicate([3, 3, 3, 3, 3])); // 3
console.log(findDuplicate([1, 1]));            // 1
console.log(findDuplicate([2, 5, 9, 6, 9, 3, 8, 9, 7, 1])); // 9
```
