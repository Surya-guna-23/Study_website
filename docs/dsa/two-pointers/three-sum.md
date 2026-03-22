---
sidebar_position: 3
title: 3Sum
---

# 3Sum

> **LeetCode 15** – [3Sum](https://leetcode.com/problems/3sum/) | **Striver (TUF)** – [3Sum Article](https://takeuforward.org/data-structure/3-sum-find-all-triplets-that-add-up-to-a-given-sum/)

## Problem Statement

Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

Notice that the solution set must not contain **duplicate triplets**.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `nums = [-1,0,1,2,-1,-4]` | `[[-1,-1,2],[-1,0,1]]` |
| 2 | `nums = [0,1,1]` | `[]` |
| 3 | `nums = [0,0,0]` | `[[0,0,0]]` |

### Constraints

- `3 <= nums.length <= 3000`
- `-10⁵ <= nums[i] <= 10⁵`

---

## Solution

**Approach:** Sort the array first. Then fix one element (`nums[i]`) and use two pointers (`j` from left, `k` from right) to find pairs that sum to `-nums[i]`. Skip duplicates at every level to avoid duplicate triplets.

- **Time Complexity:** $O(n^2)$ — for each element, the two-pointer scan is $O(n)$.
- **Space Complexity:** $O(1)$ — ignoring the output array (sorting is in-place).

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
    let sum=0;
    let i=0;
    
    let res=[]
    nums.sort((a,b)=>a-b)
    for(let i=0 ; i<nums.length;i++)
    {
        let j=i+1;
    let k=nums.length-1
        if((i<k)&&nums[i]===nums[i-1]) continue
        while(j<k)
        {
            const total = nums[i]+nums[j]+nums[k]
            if(total>0)
            {
                k--;
            }
            else if(total<0)
            {
                j++
            }
            else {
                res.push([nums[i],nums[j],nums[k]])
                j++;
                k--;
                while((j<k)&&nums[j]===nums[j-1]) j++
                while((j<k)&&nums[k]===nums[k+1]) k--
            }
        }
    }
    return res
    
};
```

---

## Dry Run

![Three Sum Dry Run](/img/dsa/three-sum-dry-run.svg)

**Example 1:** `nums = [-1, 0, 1, 2, -1, -4]`

**Step 1 — Sort:** `[-4, -1, -1, 0, 1, 2]`

**Step 2 — Iterate with two pointers:**

### `i = 0`, `nums[i] = -4`, `j = 1`, `k = 5`

| `j` | `k` | `nums[j]` | `nums[k]` | `total` | Action |
|-----|-----|-----------|-----------|---------|--------|
| 1 | 5 | -1 | 2 | -3 | `< 0` → `j++` |
| 2 | 5 | -1 | 2 | -3 | `< 0` → `j++` |
| 3 | 5 | 0 | 2 | -2 | `< 0` → `j++` |
| 4 | 5 | 1 | 2 | -1 | `< 0` → `j++` |
| 5 | 5 | — | — | — | `j < k` false → exit |

### `i = 1`, `nums[i] = -1`, `j = 2`, `k = 5`

| `j` | `k` | `nums[j]` | `nums[k]` | `total` | Action |
|-----|-----|-----------|-----------|---------|--------|
| 2 | 5 | -1 | 2 | **0** | ✅ Push `[-1, -1, 2]`, `j++`, `k--`, skip dups |
| 3 | 4 | 0 | 1 | **0** | ✅ Push `[-1, 0, 1]`, `j++`, `k--` |
| 4 | 3 | — | — | — | `j < k` false → exit |

### `i = 2`, `nums[i] = -1` → same as `nums[1]` → **skip** (duplicate)

### `i = 3`, `nums[i] = 0`, `j = 4`, `k = 5`

| `j` | `k` | `nums[j]` | `nums[k]` | `total` | Action |
|-----|-----|-----------|-----------|---------|--------|
| 4 | 5 | 1 | 2 | 3 | `> 0` → `k--` |
| 4 | 4 | — | — | — | `j < k` false → exit |

**Result:** `[[-1, -1, 2], [-1, 0, 1]]` ✅

---

## Test Cases

```js
console.log(threeSum([-1, 0, 1, 2, -1, -4]));  // [[-1,-1,2], [-1,0,1]]
console.log(threeSum([0, 1, 1]));                // []
console.log(threeSum([0, 0, 0]));                // [[0,0,0]]
console.log(threeSum([0, 0, 0, 0]));             // [[0,0,0]]
console.log(threeSum([-2, 0, 1, 1, 2]));         // [[-2,0,2], [-2,1,1]]
```
