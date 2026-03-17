---
sidebar_position: 2
title: Merge Two Sorted Lists
---

# Merge Two Sorted Lists

> **LeetCode 21** – [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)

## Problem Statement

You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one **sorted** list by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `list1 = [1,2,4]`, `list2 = [1,3,4]` | `[1,1,2,3,4,4]` |
| 2 | `list1 = []`, `list2 = []` | `[]` |
| 3 | `list1 = []`, `list2 = [0]` | `[0]` |

### Constraints

- `0 <= Number of nodes in both lists <= 50`
- `-100 <= Node.val <= 100`
- Both lists are sorted in **non-decreasing** order.

---

## Solution

**Approach:** Use a dummy node and a pointer `temp`. Compare values from both lists and attach the smaller node. When one list is exhausted, append the remainder of the other.

- **Time Complexity:** $O(n + m)$ — where `n` and `m` are the lengths of the two lists.
- **Space Complexity:** $O(1)$ — only rearranging existing nodes.

```js
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
    let temp = new ListNode(0)
    let dummy=temp
    while(list1 && list2){
        if(list1.val <list2.val)
        {
            temp.next=list1
            list1=list1.next
        }
        else{
            temp.next=list2
            list2=list2.next
        }
        temp=temp.next
    }
    if(list1){temp.next=list1}
    if(list2){temp.next=list2}
    return dummy.next
};
```

---

## Dry Run

**Example 1:** `list1 = [1,2,4]`, `list2 = [1,3,4]`

| Step | `list1` val | `list2` val | Compare | Attach | Merged so far |
|------|------------|------------|---------|--------|---------------|
| 1 | 1 | 1 | `1 < 1`? No | `list2(1)` | `1` |
| 2 | 1 | 3 | `1 < 3`? Yes | `list1(1)` | `1→1` |
| 3 | 2 | 3 | `2 < 3`? Yes | `list1(2)` | `1→1→2` |
| 4 | 4 | 3 | `4 < 3`? No | `list2(3)` | `1→1→2→3` |
| 5 | 4 | 4 | `4 < 4`? No | `list2(4)` | `1→1→2→3→4` |
| 6 | 4 | `null` | — | Append rest of `list1` | `1→1→2→3→4→4` |

**Result:** `[1, 1, 2, 3, 4, 4]` ✅

---

## Test Cases

```js
console.log(mergeTwoLists(toList([1,2,4]), toList([1,3,4]))); // [1,1,2,3,4,4]
console.log(mergeTwoLists(toList([]), toList([])));             // null
console.log(mergeTwoLists(toList([]), toList([0])));            // [0]
console.log(mergeTwoLists(toList([5]), toList([1,2,4])));      // [1,2,4,5]
```
