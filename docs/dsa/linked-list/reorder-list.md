---
sidebar_position: 4
title: Reorder List
---

# Reorder List

> **LeetCode 143** – [Reorder List](https://leetcode.com/problems/reorder-list/)

## Problem Statement

Given the `head` of a singly linked list:

$$L_0 → L_1 → … → L_{n-2} → L_{n-1}$$

Reorder it to:

$$L_0 → L_{n-1} → L_1 → L_{n-2} → L_2 → L_{n-3} → …$$

You may not modify the values in the list's nodes. Only nodes themselves may be changed.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `[1,2,3,4]` | `[1,4,2,3]` |
| 2 | `[1,2,3,4,5]` | `[1,5,2,4,3]` |

### Constraints

- `1 <= Number of nodes <= 5 * 10⁴`
- `1 <= Node.val <= 1000`

---

## Solution

**Approach:** Push all nodes (except head) onto a stack. Then alternate — pick from the front (`curr.next`) and from the back (stack pop). Stop when we reach the middle.

- **Time Complexity:** $O(n)$ — one pass to build the stack, one pass to reorder.
- **Space Complexity:** $O(n)$ — the stack holds `n-1` nodes.

```js
var reorderList = function(head) {
    if (!head || !head.next) return;

    let stack = [];
    let temp = head.next;

    // push NODES into stack
    while (temp !== null) {
        stack.push(temp);
        temp = temp.next;
    }

    let curr = head;
    let length = stack.length;

    while (length > 0) {
        let last = stack.pop();
        length--;

        // stop at middle
        if (curr === last || curr.next === last) {
            last.next = null;
            break;
        }

        let next = curr.next;
        curr.next = last;
        last.next = next;
        curr = next;
    }
};
```

---

## Dry Run

**Example 1:** `head = [1, 2, 3, 4]`

**Stack:** `[2, 3, 4]` (all nodes after head)

| Step | `curr` | `last` (pop) | Action | List state |
|------|--------|-------------|--------|------------|
| 1 | 1 | 4 | `next = 2`, insert `4` between `1` and `2` | `1→4→2→3` |
| 2 | 2 | 3 | `curr.next === last` → set `3.next = null`, break | `1→4→2→3` |

**Result:** `[1, 4, 2, 3]` ✅

---

**Example 2:** `head = [1, 2, 3, 4, 5]`

**Stack:** `[2, 3, 4, 5]`

| Step | `curr` | `last` (pop) | Action | List state |
|------|--------|-------------|--------|------------|
| 1 | 1 | 5 | Insert `5` between `1` and `2` | `1→5→2→3→4` |
| 2 | 2 | 4 | Insert `4` between `2` and `3` | `1→5→2→4→3` |
| 3 | 3 | 3 | `curr === last` → set `3.next = null`, break | `1→5→2→4→3` |

**Result:** `[1, 5, 2, 4, 3]` ✅

---

## Test Cases

```js
let list1 = toList([1,2,3,4]);
reorderList(list1);
console.log(list1); // [1,4,2,3]

let list2 = toList([1,2,3,4,5]);
reorderList(list2);
console.log(list2); // [1,5,2,4,3]

let list3 = toList([1]);
reorderList(list3);
console.log(list3); // [1]
```
