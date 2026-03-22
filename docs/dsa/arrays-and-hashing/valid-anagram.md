---
sidebar_position: 2
title: Valid Anagram
---

# Valid Anagram

> **LeetCode 242** – [Valid Anagram](https://leetcode.com/problems/valid-anagram/) | **Striver (TUF)** – [Valid Anagram Article](https://takeuforward.org/data-structure/check-if-two-strings-are-anagrams-of-each-other/)

## Problem Statement

Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.

An **anagram** is a word formed by rearranging the letters of another word, using all the original letters exactly once.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `s = "anagram"`, `t = "nagaram"` | `true` |
| 2 | `s = "rat"`, `t = "car"` | `false` |

### Constraints

- `1 <= s.length, t.length <= 5 * 10⁴`
- `s` and `t` consist of lowercase English letters.

---

## Solution

**Approach:** Use two `Map`s to count the frequency of each character in `s` and `t`. If the lengths differ, return `false` immediately. Then compare the frequency of every character in `t`'s map against `s`'s map.

- **Time Complexity:** $O(n)$ — two passes through the strings (one to build maps, one to compare).
- **Space Complexity:** $O(n)$ — two maps storing character frequencies (at most 26 keys for lowercase letters).

```js
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function(s, t) {
    t=t.split("")
    s= s.split("")
    let smap= new Map()
    let tmap = new Map()
    if(t.length!=s.length)
    {
        return false
    }
    for(let i=0;i<t.length;i++)
    {
        smap.set(s[i],(smap.get(s[i])||0)+1)
        tmap.set(t[i],(tmap.get(t[i])||0)+1)
    }
    for(const [key ,value] of tmap)
    {
        if(smap.get(key)!=tmap.get(key))
        {
            return false
        }
    }
    return true
};
```

---

## Dry Run

![Valid Anagram Dry Run](/img/dsa/valid-anagram-dry-run.svg)

Let's walk through **Example 1**: `s = "anagram"`, `t = "nagaram"`

**Step 1 — Length check:** Both strings have length `7` → continue.

**Step 2 — Build frequency maps:**

| `i` | `s[i]` | `smap` | `t[i]` | `tmap` |
|-----|--------|--------|--------|--------|
| 0 | `a` | `{a:1}` | `n` | `{n:1}` |
| 1 | `n` | `{a:1, n:1}` | `a` | `{n:1, a:1}` |
| 2 | `a` | `{a:2, n:1}` | `g` | `{n:1, a:1, g:1}` |
| 3 | `g` | `{a:2, n:1, g:1}` | `a` | `{n:1, a:2, g:1}` |
| 4 | `r` | `{a:2, n:1, g:1, r:1}` | `r` | `{n:1, a:2, g:1, r:1}` |
| 5 | `a` | `{a:3, n:1, g:1, r:1}` | `a` | `{n:1, a:3, g:1, r:1}` |
| 6 | `m` | `{a:3, n:1, g:1, r:1, m:1}` | `m` | `{n:1, a:3, g:1, r:1, m:1}` |

**Step 3 — Compare maps:**

| Key | `smap.get(key)` | `tmap.get(key)` | Match? |
|-----|-----------------|-----------------|--------|
| `n` | 1 | 1 | ✅ |
| `a` | 3 | 3 | ✅ |
| `g` | 1 | 1 | ✅ |
| `r` | 1 | 1 | ✅ |
| `m` | 1 | 1 | ✅ |

All frequencies match → **Return `true`** ✅

---

## Test Cases

```js
console.log(isAnagram("anagram", "nagaram"));  // true
console.log(isAnagram("rat", "car"));          // false
console.log(isAnagram("a", "a"));              // true   (single char)
console.log(isAnagram("ab", "a"));             // false  (different lengths)
console.log(isAnagram("aacc", "ccac"));        // false  (same length, different freq)
console.log(isAnagram("listen", "silent"));    // true
```
