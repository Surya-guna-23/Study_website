---
sidebar_position: 2
title: Two Sum II - Sorted Array
---

# Two Sum II - Input Array Is Sorted

> **LeetCode 167** – [Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)

## Problem Statement

Given a **1-indexed** array of integers `numbers` that is already sorted in **non-decreasing order**, find two numbers such that they add up to a specific `target` number.

Return the indices of the two numbers (**1-indexed**) as an integer array `[index1, index2]`.

You may not use the same element twice. The tests are generated such that there is **exactly one solution**.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `numbers = [2,7,11,15]`, `target = 9` | `[1,2]` |
| 2 | `numbers = [2,3,4]`, `target = 6` | `[1,3]` |
| 3 | `numbers = [-1,0]`, `target = -1` | `[1,2]` |

### Constraints

- `2 <= numbers.length <= 3 * 10⁴`
- `-1000 <= numbers[i] <= 1000`
- `numbers` is sorted in **non-decreasing** order.
- Exactly one solution exists.

---

## Solution

**Approach:** Use a `Map` to store each number's index. For each element, check if `target - numbers[i]` exists in the map. Since the result is **1-indexed**, add `1` to both indices.

- **Time Complexity:** $O(n)$ — single pass through the array.
- **Space Complexity:** $O(n)$ — the map stores at most `n` entries.

```js
/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(numbers, target) {
    let map =new Map()
    for(let i=0;i<numbers.length;i++)
    {
        if(map.has(target-numbers[i]))
        {
            return[map.get(target-numbers[i])+1,i+1]
        }
        else{
            map.set(numbers[i],i)
        }
    }
    
};
```

---

## Dry Run

![Two Sum II Dry Run](/img/dsa/two-sum-ii-dry-run.svg)

**Example 1:** `numbers = [2, 7, 11, 15]`, `target = 9`

| Step | `i` | `numbers[i]` | `target - numbers[i]` | `map.has(...)` | `map` (after step) | Action |
|------|-----|-------------|----------------------|----------------|---------------------|--------|
| 1 | 0 | 2 | 7 | No | `{2 → 0}` | Store index of `2` |
| 2 | 1 | 7 | 2 | **Yes** (`2` at index `0`) | — | Return `[0+1, 1+1]` = **`[1, 2]`** ✅ |

---

## Test Cases

```js
console.log(twoSum([2, 7, 11, 15], 9));  // [1, 2]
console.log(twoSum([2, 3, 4], 6));        // [1, 3]
console.log(twoSum([-1, 0], -1));         // [1, 2]
console.log(twoSum([1, 2, 3, 4], 7));     // [3, 4]
console.log(twoSum([5, 25, 75], 100));    // [2, 3]
```
