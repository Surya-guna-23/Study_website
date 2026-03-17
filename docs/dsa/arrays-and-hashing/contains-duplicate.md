---
sidebar_position: 1
title: Contains Duplicate
---

# Contains Duplicate

> **LeetCode 217** – [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)

## Problem Statement

Given an integer array `nums`, return `true` if any value appears **at least twice** in the array, and return `false` if every element is distinct.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `nums = [1, 2, 3, 1]` | `true` |
| 2 | `nums = [1, 2, 3, 4]` | `false` |
| 3 | `nums = [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]` | `true` |

### Constraints

- `1 <= nums.length <= 10⁵`
- `-10⁹ <= nums[i] <= 10⁹`

---

## Solution

**Approach:** Use a `Set` to track numbers we've already seen. As we iterate through the array, if the current number is already in the set we return `true` immediately. Otherwise we add it and continue.

- **Time Complexity:** $O(n)$ — single pass through the array.
- **Space Complexity:** $O(n)$ — the set can hold at most `n` elements.

```js
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function(nums) {
    let res = new Set()
    for (let i=0;i<nums.length;i++)
    {
        if(res.has(nums[i]))
        {
            return true;
        }
        else{
            res.add(nums[i])
        }
    }
    return false
    
};
```

---

## Dry Run

Let's walk through **Example 1**: `nums = [1, 2, 3, 1]`

| Step | `i` | `nums[i]` | `res` (Set) | `res.has(nums[i])?` | Action |
|------|-----|-----------|-------------|----------------------|--------|
| 1 | 0 | 1 | `{}` | No | Add `1` → `{1}` |
| 2 | 1 | 2 | `{1}` | No | Add `2` → `{1, 2}` |
| 3 | 2 | 3 | `{1, 2}` | No | Add `3` → `{1, 2, 3}` |
| 4 | 3 | 1 | `{1, 2, 3}` | **Yes** | **Return `true`** ✅ |

Duplicate `1` found at index `3` — we exit early without checking the rest of the array.

---

## Test Cases

```js
console.log(containsDuplicate([1, 2, 3, 1]));                      // true
console.log(containsDuplicate([1, 2, 3, 4]));                      // false
console.log(containsDuplicate([1, 1, 1, 3, 3, 4, 3, 2, 4, 2]));   // true
console.log(containsDuplicate([0]));                                // false  (single element)
console.log(containsDuplicate([1, 1]));                             // true   (minimum duplicate)
console.log(containsDuplicate([-1, -1, 2]));                       // true   (negative numbers)
```
