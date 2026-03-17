---
sidebar_position: 3
title: Two Sum
---

# Two Sum

> **LeetCode 1** – [Two Sum](https://leetcode.com/problems/two-sum/)

## Problem Statement

Given an array of integers `nums` and an integer `target`, return **indices of the two numbers** such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `nums = [2,7,11,15]`, `target = 9` | `[0,1]` |
| 2 | `nums = [3,2,4]`, `target = 6` | `[1,2]` |
| 3 | `nums = [3,3]`, `target = 6` | `[0,1]` |

### Constraints

- `2 <= nums.length <= 10⁴`
- `-10⁹ <= nums[i] <= 10⁹`
- `-10⁹ <= target <= 10⁹`
- Only one valid answer exists.

---

## Solution

**Approach:** Use a `Map` to store each number's index as we iterate. For every element, check if `target - nums[i]` already exists in the map. If it does, we've found our pair.

- **Time Complexity:** $O(n)$ — single pass through the array.
- **Space Complexity:** $O(n)$ — the map stores at most `n` entries.

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    let map = new Map ()
    let res=[]
    for(let i=0;i<nums.length;i++)
    {
        if(map.has(target-nums[i]))
        {
            return [map.get(target-nums[i]),i]
        }
        else{
            map.set(nums[i],i)
        }
    }
};
```

---

## Dry Run

Let's walk through **Example 1**: `nums = [2, 7, 11, 15]`, `target = 9`

| Step | `i` | `nums[i]` | `target - nums[i]` | `map.has(...)` | `map` (after step) | Action |
|------|-----|-----------|---------------------|----------------|---------------------|--------|
| 1 | 0 | 2 | 7 | No | `{2 → 0}` | Store index of `2` |
| 2 | 1 | 7 | 2 | **Yes** (`2` at index `0`) | — | **Return `[0, 1]`** ✅ |

We find the complement `2` in the map on the second iteration and return immediately.

---

## Test Cases

```js
console.log(twoSum([2, 7, 11, 15], 9));   // [0, 1]
console.log(twoSum([3, 2, 4], 6));         // [1, 2]
console.log(twoSum([3, 3], 6));            // [0, 1]
console.log(twoSum([1, 5, 3, 7], 8));      // [1, 2]  (5 + 3)
console.log(twoSum([-1, -2, -3, -4], -6)); // [1, 3]  (-2 + -4)
```
