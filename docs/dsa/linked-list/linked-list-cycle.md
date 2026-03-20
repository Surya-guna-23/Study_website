---
sidebar_position: 3
title: Linked List Cycle
---

# Linked List Cycle

> **LeetCode 141** – [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)

## Problem Statement

Given `head`, the head of a linked list, determine if the linked list has a **cycle** in it.

A cycle exists if some node in the list can be reached again by continuously following the `next` pointer.

Return `true` if there is a cycle, otherwise return `false`.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `head = [3,2,0,-4]`, tail connects to index `1` | `true` |
| 2 | `head = [1,2]`, tail connects to index `0` | `true` |
| 3 | `head = [1]`, no cycle | `false` |

### Constraints

- `0 <= Number of nodes <= 10⁴`
- `-10⁵ <= Node.val <= 10⁵`

---

## Solution

**Approach:** Floyd's Tortoise and Hare — use two pointers, `slow` moves one step and `fast` moves two steps. If there's a cycle, they will eventually meet. If `fast` reaches `null`, there's no cycle.

- **Time Complexity:** $O(n)$ — fast pointer traverses at most `2n` steps.
- **Space Complexity:** $O(1)$ — only two pointers.

```js
/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function(head) {
    let fast=head
    let slow=head
    if(head ===null  || head.next ===null)
    {
        return false
    }
    while(fast && fast.next)
    {
        fast=fast.next.next
        slow=slow.next
        if(fast===slow)
        {
            return true
        }
    }
    return false
    
};
```

---

## Dry Run

![Linked List Cycle Dry Run](/img/dsa/linked-list-cycle-dry-run.svg)

**Example 1:** `head = [3,2,0,-4]`, tail connects to node at index `1` (value `2`)

```
3 → 2 → 0 → -4
    ↑         |
    └─────────┘
```

| Step | `slow` | `fast` | Meet? |
|------|--------|--------|-------|
| 0 | 3 | 3 | — |
| 1 | 2 | 0 | No |
| 2 | 0 | 2 | No |
| 3 | -4 | 0 | No |
| 4 | **2** | **2** | **Yes** ✅ |

Both pointers meet at node with value `2` → **Return `true`** ✅

---

## Test Cases

```js
// Create cycle: [3,2,0,-4] → tail connects to index 1
let n1 = new ListNode(3), n2 = new ListNode(2),
    n3 = new ListNode(0), n4 = new ListNode(-4);
n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n2;
console.log(hasCycle(n1)); // true

// No cycle
console.log(hasCycle(toList([1]))); // false

// Empty list
console.log(hasCycle(null)); // false
```
