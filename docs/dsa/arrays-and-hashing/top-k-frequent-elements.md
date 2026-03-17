---
sidebar_position: 5
title: Top K Frequent Elements
---

# Top K Frequent Elements

> **LeetCode 347** – [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)

## Problem Statement

Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in **any order**.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `nums = [1,1,1,2,2,3]`, `k = 2` | `[1,2]` |
| 2 | `nums = [1]`, `k = 1` | `[1]` |

### Constraints

- `1 <= nums.length <= 10⁵`
- `-10⁴ <= nums[i] <= 10⁴`
- `k` is in the range `[1, number of unique elements]`.
- It is guaranteed that the answer is unique.

---

## Solution

**Approach:** First, build a frequency map. Then sort the entries by frequency in descending order and pick the first `k` elements.

- **Time Complexity:** $O(n \log n)$ — dominated by sorting the frequency entries.
- **Space Complexity:** $O(n)$ — the map and sorted array.

```js
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
var topKFrequent = function(nums, k) {
    let hash = new Map();

    // Count frequency
    for (let num of nums) {
        hash.set(num, (hash.get(num) || 0) + 1);
    }

    // Sort by frequency (descending order)
    let sorted = [...hash.entries()].sort((a, b) => b[1] - a[1]);

    // Extract top k elements
    return sorted.slice(0, k).map(([key]) => key);
};
```

---

## Dry Run

Let's walk through **Example 1**: `nums = [1, 1, 1, 2, 2, 3]`, `k = 2`

**Step 1 — Build frequency map:**

| Iteration | `num` | `hash` |
|-----------|-------|--------|
| 1 | 1 | `{1: 1}` |
| 2 | 1 | `{1: 2}` |
| 3 | 1 | `{1: 3}` |
| 4 | 2 | `{1: 3, 2: 1}` |
| 5 | 2 | `{1: 3, 2: 2}` |
| 6 | 3 | `{1: 3, 2: 2, 3: 1}` |

**Step 2 — Sort by frequency (descending):**

| Entry | Frequency |
|-------|-----------|
| `[1, 3]` | 3 |
| `[2, 2]` | 2 |
| `[3, 1]` | 1 |

**Step 3 — Slice top `k = 2` and extract keys:**

`sorted.slice(0, 2)` → `[[1, 3], [2, 2]]` → `.map(([key]) => key)` → `[1, 2]`

**Result:** `[1, 2]` ✅

---

## Test Cases

```js
console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2));       // [1, 2]
console.log(topKFrequent([1], 1));                        // [1]
console.log(topKFrequent([4, 4, 4, 1, 1, 2, 2, 2], 2)); // [4, 2]
console.log(topKFrequent([3, 3, 3, 3], 1));               // [3]
console.log(topKFrequent([5, 5, 1, 1, 2], 2));            // [5, 1]
```
