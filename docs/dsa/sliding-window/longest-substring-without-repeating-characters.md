---
sidebar_position: 2
title: Longest Substring Without Repeating Characters
---

# Longest Substring Without Repeating Characters

> **LeetCode 3** – [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)

## Problem Statement

Given a string `s`, find the length of the **longest substring** without repeating characters.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `s = "abcabcbb"` | `3` |
| 2 | `s = "bbbbb"` | `1` |
| 3 | `s = "pwwkew"` | `3` |

### Constraints

- `0 <= s.length <= 5 * 10⁴`
- `s` consists of English letters, digits, symbols and spaces.

---

## Solution

**Approach:** Use a sliding window with an array `h` of size 256 (all ASCII characters) that stores the **last seen index** of each character. When we encounter a character whose last index is within the current window (`>= l`), we shrink the window by moving `l` past that index.

- **Time Complexity:** $O(n)$ — single pass, each character visited once by `r`.
- **Space Complexity:** $O(1)$ — fixed-size array of 256 entries.

```js
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    let h= new Array(256).fill(-1)
    let l=0,r=0;
    let n=s.length
    let max=0
    while(r<n)
    {
        let idx= s.charCodeAt(r)

        if(h[idx]>=l)
        {
            l=h[idx]+1

        }

        max=Math.max(max,r-l+1)
        h[idx]=r
        r++
    }
    return max
};
```

---

## Dry Run

![Longest Substring Without Repeating Characters Dry Run](/img/dsa/longest-substring-without-repeating-characters-dry-run.svg)

**Example 1:** `s = "abcabcbb"`

| Step | `r` | `s[r]` | `h[idx]` | `h[idx] >= l?` | `l` (after) | Window | `r-l+1` | `max` |
|------|-----|--------|----------|----------------|-------------|--------|----------|-------|
| 1 | 0 | `a` | -1 | No | 0 | `"a"` | 1 | 1 |
| 2 | 1 | `b` | -1 | No | 0 | `"ab"` | 2 | 2 |
| 3 | 2 | `c` | -1 | No | 0 | `"abc"` | 3 | **3** |
| 4 | 3 | `a` | 0 | Yes (`0 >= 0`) | 1 | `"bca"` | 3 | 3 |
| 5 | 4 | `b` | 1 | Yes (`1 >= 1`) | 2 | `"cab"` | 3 | 3 |
| 6 | 5 | `c` | 2 | Yes (`2 >= 2`) | 3 | `"abc"` | 3 | 3 |
| 7 | 6 | `b` | 4 | Yes (`4 >= 3`) | 5 | `"cb"` | 2 | 3 |
| 8 | 7 | `b` | 6 | Yes (`6 >= 5`) | 7 | `"b"` | 1 | 3 |

**Result:** `3` ✅ (substring `"abc"`)

---

## Test Cases

```js
console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("bbbbb"));    // 1
console.log(lengthOfLongestSubstring("pwwkew"));   // 3
console.log(lengthOfLongestSubstring(""));          // 0
console.log(lengthOfLongestSubstring(" "));         // 1
console.log(lengthOfLongestSubstring("dvdf"));      // 3
console.log(lengthOfLongestSubstring("abba"));      // 2
```
