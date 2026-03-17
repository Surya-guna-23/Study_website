---
sidebar_position: 1
title: Valid Palindrome
---

# Valid Palindrome

> **LeetCode 125** – [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)

## Problem Statement

A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `s = "A man, a plan, a canal: Panama"` | `true` |
| 2 | `s = "race a car"` | `false` |
| 3 | `s = " "` | `true` |

### Constraints

- `1 <= s.length <= 2 * 10⁵`
- `s` consists only of printable ASCII characters.

---

## Solution

**Approach:** First, filter out non-alphanumeric characters and convert to lowercase. Then use two pointers — one at the start (`i`) and one at the end (`j`) — moving inward and comparing characters.

- **Time Complexity:** $O(n)$ — one pass to clean, one pass to compare.
- **Space Complexity:** $O(n)$ — the cleaned string.

```js
/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function(s) {
   let str=""
   for(let ch of s)
   {
    ch=ch.toLowerCase()
    if((ch>="a"&&ch<="z")||(ch>="0"&&ch<="9"))
    {
        str+=ch
    }}
    let i=0;
    let j=str.length-1
    while(i<j)
    {
        if(str[i]===str[j])
        {
            i++
            j--
        }
        else{
            return false
        }
        
    }
    return true
   
};
```

---

## Dry Run

**Example 1:** `s = "A man, a plan, a canal: Panama"`

**Step 1 — Clean string:**

`"A man, a plan, a canal: Panama"` → `"amanaplanacanalpanama"`

**Step 2 — Two pointer comparison:**

| Step | `i` | `j` | `str[i]` | `str[j]` | Match? | Action |
|------|-----|-----|----------|----------|--------|--------|
| 1 | 0 | 20 | `a` | `a` | ✅ | `i++`, `j--` |
| 2 | 1 | 19 | `m` | `m` | ✅ | `i++`, `j--` |
| 3 | 2 | 18 | `a` | `a` | ✅ | `i++`, `j--` |
| 4 | 3 | 17 | `n` | `n` | ✅ | `i++`, `j--` |
| 5 | 4 | 16 | `a` | `a` | ✅ | `i++`, `j--` |
| ... | ... | ... | ... | ... | ✅ | ... |
| 10 | 9 | 11 | `a` | `a` | ✅ | `i++`, `j--` |
| 11 | 10 | 10 | `c` | `c` | — | `i < j` is false → exit |

All characters matched → **Return `true`** ✅

---

## Test Cases

```js
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car"));                     // false
console.log(isPalindrome(" "));                              // true
console.log(isPalindrome("0P"));                             // false
console.log(isPalindrome("a"));                              // true
console.log(isPalindrome("12321"));                          // true
```
