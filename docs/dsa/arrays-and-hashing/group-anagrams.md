---
sidebar_position: 4
title: Group Anagrams
---

# Group Anagrams

> **LeetCode 49** – [Group Anagrams](https://leetcode.com/problems/group-anagrams/)

## Problem Statement

Given an array of strings `strs`, group the **anagrams** together. You can return the answer in **any order**.

An **anagram** is a word formed by rearranging the letters of another word, using all the original letters exactly once.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `strs = ["eat","tea","tan","ate","nat","bat"]` | `[["bat"],["nat","tan"],["ate","eat","tea"]]` |
| 2 | `strs = [""]` | `[[""]]` |
| 3 | `strs = ["a"]` | `[["a"]]` |

### Constraints

- `1 <= strs.length <= 10⁴`
- `0 <= strs[i].length <= 100`
- `strs[i]` consists of lowercase English letters.

---

## Solution

**Approach:** For each string, sort its characters alphabetically to create a canonical key. All anagrams will produce the same sorted key. Use a `Map` to group strings by their sorted key.

- **Time Complexity:** $O(n \cdot k \log k)$ — where `n` is the number of strings and `k` is the maximum string length (sorting each string).
- **Space Complexity:** $O(n \cdot k)$ — storing all strings in the map.

```js
/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function(strs) {
    let hash = new Map();

    for (let str of strs) {
        // Sort each string alphabetically to use as a key
        let sorted = str.split('').sort().join('');

        if (hash.has(sorted)) {
            hash.get(sorted).push(str);
        } else {
            hash.set(sorted, [str]);
        }
    }

    // Convert Map values to array
    return Array.from(hash.values());
};
```

---

## Dry Run

![Group Anagrams Dry Run](/img/dsa/group-anagrams-dry-run.svg)

Let's walk through **Example 1**: `strs = ["eat","tea","tan","ate","nat","bat"]`

| Step | `str` | `sorted` (key) | `hash.has(sorted)?` | Action | `hash` |
|------|-------|-----------------|----------------------|--------|--------|
| 1 | `"eat"` | `"aet"` | No | Create `"aet" → ["eat"]` | `{aet: ["eat"]}` |
| 2 | `"tea"` | `"aet"` | Yes | Push → `["eat","tea"]` | `{aet: ["eat","tea"]}` |
| 3 | `"tan"` | `"ant"` | No | Create `"ant" → ["tan"]` | `{aet: ["eat","tea"], ant: ["tan"]}` |
| 4 | `"ate"` | `"aet"` | Yes | Push → `["eat","tea","ate"]` | `{aet: ["eat","tea","ate"], ant: ["tan"]}` |
| 5 | `"nat"` | `"ant"` | Yes | Push → `["tan","nat"]` | `{aet: ["eat","tea","ate"], ant: ["tan","nat"]}` |
| 6 | `"bat"` | `"abt"` | No | Create `"abt" → ["bat"]` | `{aet: ["eat","tea","ate"], ant: ["tan","nat"], abt: ["bat"]}` |

**Result:** `[["eat","tea","ate"], ["tan","nat"], ["bat"]]` ✅

---

## Test Cases

```js
console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));
// [["eat","tea","ate"], ["tan","nat"], ["bat"]]

console.log(groupAnagrams([""]));
// [[""]]

console.log(groupAnagrams(["a"]));
// [["a"]]

console.log(groupAnagrams(["abc","bca","cab","xyz","zyx"]));
// [["abc","bca","cab"], ["xyz","zyx"]]

console.log(groupAnagrams(["no","on","is","si"]));
// [["no","on"], ["is","si"]]
```
