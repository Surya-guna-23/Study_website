---
sidebar_position: 1
title: Reverse Linked List
---

# Reverse Linked List

> **LeetCode 206** – [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/) | **Striver (TUF)** – [Reverse Linked List Article](https://takeuforward.org/data-structure/reverse-a-linked-list/)

## Problem Statement

Given the `head` of a singly linked list, reverse the list, and return the reversed list.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `head = [1,2,3,4,5]` | `[5,4,3,2,1]` |
| 2 | `head = [1,2]` | `[2,1]` |
| 3 | `head = []` | `[]` |

### Constraints

- `0 <= Number of nodes <= 5000`
- `-5000 <= Node.val <= 5000`

---

## Solution

**Approach:** Recursive — recurse to the end of the list, then on the way back, reverse the pointers. The last node becomes the new head.

- **Time Complexity:** $O(n)$ — visit each node once.
- **Space Complexity:** $O(n)$ — recursion stack depth.

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
  function reverse(head)
  {
    if(head===null || head.next===null)
    {
        return head
    }
    const newhead = reverse(head.next)
    const front=head.next
    front.next=head
    head.next=null
    return newhead
  }
   return reverse(head)
};
```

---

## Dry Run

![Reverse Linked List Dry Run](/img/dsa/reverse-linked-list-dry-run.svg)

**Example:** `head = [1, 2, 3, 4, 5]`

**Recursion going down:**

```
reverse(1) → reverse(2) → reverse(3) → reverse(4) → reverse(5)
                                                      ↳ returns 5 (base case)
```

**Unwinding (reversing pointers):**

| Return from | `head` | `front` | Action | List state |
|-------------|--------|---------|--------|------------|
| `reverse(5)` | 5 | — | Base case, return `5` | `1→2→3→4→5` |
| `reverse(4)` | 4 | 5 | `5.next = 4`, `4.next = null` | `1→2→3→4←5` |
| `reverse(3)` | 3 | 4 | `4.next = 3`, `3.next = null` | `1→2→3←4←5` |
| `reverse(2)` | 2 | 3 | `3.next = 2`, `2.next = null` | `1→2←3←4←5` |
| `reverse(1)` | 1 | 2 | `2.next = 1`, `1.next = null` | `1←2←3←4←5` |

**New head:** `5` → **Result:** `[5, 4, 3, 2, 1]` ✅

---

## Test Cases

```js
// Helper to create linked list from array
function toList(arr) {
    let dummy = new ListNode(0);
    let curr = dummy;
    for (let v of arr) { curr.next = new ListNode(v); curr = curr.next; }
    return dummy.next;
}

console.log(reverseList(toList([1,2,3,4,5]))); // [5,4,3,2,1]
console.log(reverseList(toList([1,2])));         // [2,1]
console.log(reverseList(toList([])));            // null
console.log(reverseList(toList([1])));           // [1]
```
