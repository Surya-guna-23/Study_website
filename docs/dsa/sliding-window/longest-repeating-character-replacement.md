---
sidebar_position: 3
title: Longest Repeating Character Replacement
---

# Longest Repeating Character Replacement

> **LeetCode 424** – [Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/)

## Problem Statement

You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English letter. You can perform this operation at most `k` times.

Return the length of the **longest substring** containing the same letter you can get after performing the above operations.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `s = "ABAB"`, `k = 2` | `4` |
| 2 | `s = "AABABBA"`, `k = 1` | `4` |

### Constraints

- `1 <= s.length <= 10⁵`
- `s` consists of only uppercase English letters.
- `0 <= k <= s.length`

---

## Solution

**Approach:** Use a sliding window `[l, r]`. Maintain a frequency array `h` for the 26 uppercase letters and track the `maxfreq` (count of the most frequent character in the window). The number of characters we need to replace is `(window size) - maxfreq`. If this exceeds `k`, shrink from the left.

**Key insight:** We never need to decrease `maxfreq` when shrinking — if we've seen a window of that quality before, only a wider window can improve the answer.

- **Time Complexity:** $O(n)$ — each pointer moves at most `n` times.
- **Space Complexity:** $O(1)$ — fixed array of 26 entries.

```js
/*
 * @param {string} s
 * @param {number} k
 * @return {number}
 */
var characterReplacement = function(s, k) {
    let l=0,r=0,maxlen=0,maxfreq=0
    let h = new Array(26).fill(0)

    while(r<s.length)
    {
        h[s.charCodeAt(r)-"A".charCodeAt(0)]++
        maxfreq = Math.max(maxfreq,h[s.charCodeAt(r)-"A".charCodeAt(0)])
        if((r-l+1)-maxfreq>k)
        {
            h[s.charCodeAt(l)-"A".charCodeAt(0)]--
            l++
        }
        maxlen=Math.max(maxlen,(r-l+1))
        r++
    }
    return maxlen
};
```

---

## Dry Run

**Example 2:** `s = "AABABBA"`, `k = 1`

| Step | `r` | `s[r]` | `h` (non-zero) | `maxfreq` | Window size `r-l+1` | Replacements needed | `> k`? | `l` | `maxlen` |
|------|-----|--------|----------------|-----------|---------------------|---------------------|--------|-----|----------|
| 1 | 0 | A | `{A:1}` | 1 | 1 | 0 | No | 0 | 1 |
| 2 | 1 | A | `{A:2}` | 2 | 2 | 0 | No | 0 | 2 |
| 3 | 2 | B | `{A:2, B:1}` | 2 | 3 | 1 | No | 0 | 3 |
| 4 | 3 | A | `{A:3, B:1}` | 3 | 4 | 1 | No | 0 | **4** |
| 5 | 4 | B | `{A:3, B:2}` | 3 | 5 | 2 | **Yes** | → 1 | 4 |
|   |   |   | `{A:2, B:2}` |   | 4 |   |   |     |   |
| 6 | 5 | B | `{A:2, B:3}` | 3 | 5 | 2 | **Yes** | → 2 | 4 |
|   |   |   | `{A:1, B:3}` |   | 4 |   |   |     |   |
| 7 | 6 | A | `{A:2, B:3}` | 3 | 5 | 2 | **Yes** | → 3 | 4 |
|   |   |   | `{A:2, B:2}` |   | 4 |   |   |     |   |

**Result:** `4` ✅ (substring `"AABA"` — replace the one `B` with `A`)

---

## Test Cases

```js
console.log(characterReplacement("ABAB", 2));    // 4
console.log(characterReplacement("AABABBA", 1)); // 4
console.log(characterReplacement("AAAA", 0));     // 4
console.log(characterReplacement("ABCD", 2));     // 3
console.log(characterReplacement("AAAB", 0));     // 3
console.log(characterReplacement("ABBB", 2));     // 4
```
