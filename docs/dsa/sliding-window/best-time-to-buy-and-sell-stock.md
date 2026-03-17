---
sidebar_position: 1
title: Best Time to Buy and Sell Stock
---

# Best Time to Buy and Sell Stock

> **LeetCode 121** – [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)

## Problem Statement

You are given an array `prices` where `prices[i]` is the price of a given stock on the `iᵗʰ` day.

You want to maximize your profit by choosing a **single day** to buy and a **different day in the future** to sell.

Return the maximum profit you can achieve. If no profit is possible, return `0`.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `prices = [7,1,5,3,6,4]` | `5` |
| 2 | `prices = [7,6,4,3,1]` | `0` |

### Constraints

- `1 <= prices.length <= 10⁵`
- `0 <= prices[i] <= 10⁴`

---

## Solution

**Approach:** Use two pointers — `i` tracks the buy day (minimum price so far) and `j` scans forward for the sell day. If `prices[j] > prices[i]`, calculate profit. Otherwise, move the buy pointer to `j` since we found a cheaper price.

- **Time Complexity:** $O(n)$ — single pass through the array.
- **Space Complexity:** $O(1)$ — only a few variables.

```js
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    let max=0
    let i=0;
    let j=1
    while(j<prices.length)
    {
        if(prices[j]>prices[i])
        {
            max=Math.max(max,(prices[j]-prices[i]))

        }
        else{
            i=j
        }
        j++
    }
    return max
};
```

---

## Dry Run

**Example 1:** `prices = [7, 1, 5, 3, 6, 4]`

| Step | `i` | `j` | `prices[i]` | `prices[j]` | Condition | Profit | `max` | Action |
|------|-----|-----|-------------|-------------|-----------|--------|-------|--------|
| 1 | 0 | 1 | 7 | 1 | `1 < 7` | — | 0 | `i = j` → `i = 1` |
| 2 | 1 | 2 | 1 | 5 | `5 > 1` | 4 | 4 | Keep `i`, `j++` |
| 3 | 1 | 3 | 1 | 3 | `3 > 1` | 2 | 4 | Keep `i`, `j++` |
| 4 | 1 | 4 | 1 | 6 | `6 > 1` | **5** | **5** | Keep `i`, `j++` |
| 5 | 1 | 5 | 1 | 4 | `4 > 1` | 3 | 5 | Keep `i`, `j++` |
| — | — | 6 | — | — | — | — | — | `j < length` false → exit |

**Result:** `5` ✅ (buy at day 1 for `1`, sell at day 4 for `6`)

---

## Test Cases

```js
console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5
console.log(maxProfit([7, 6, 4, 3, 1]));     // 0
console.log(maxProfit([2, 4, 1]));            // 2
console.log(maxProfit([1]));                  // 0
console.log(maxProfit([1, 2]));               // 1
console.log(maxProfit([3, 1, 4, 8, 7, 2, 5])); // 7  (buy at 1, sell at 8)
```
