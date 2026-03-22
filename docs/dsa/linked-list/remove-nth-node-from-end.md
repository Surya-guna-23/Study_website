---
sidebar_position: 5
title: Remove Nth Node From End of List
---

# Remove Nth Node From End of List

> **LeetCode 19** – [Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) | **Striver (TUF)** – [Remove Nth Node From End Article](https://takeuforward.org/data-structure/remove-n-th-node-from-the-end-of-a-linked-list/)

## Problem Statement

Given the `head` of a linked list, remove the `nᵗʰ` node from the **end** of the list and return its head.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `head = [1,2,3,4,5]`, `n = 2` | `[1,2,3,5]` |
| 2 | `head = [1]`, `n = 1` | `[]` |
| 3 | `head = [1,2]`, `n = 1` | `[1]` |

### Constraints

- `1 <= Number of nodes <= 30`
- `0 <= Node.val <= 100`
- `1 <= n <= Number of nodes`

---

## Solution

**Approach:** Use two pointers — move `fast` ahead by `n` steps. Then move both `fast` and `slow` together until `fast` reaches the last node. Now `slow` is right before the node to remove.

- **Time Complexity:** $O(n)$ — single pass.
- **Space Complexity:** $O(1)$ — only two pointers.

```js
var removeNthFromEnd = function(head, n) {
    let fast = head
    let slow = head

    // Move fast n steps ahead
    for (let i = 0; i < n; i++) {
        fast = fast.next
    }

    // If fast is null, remove head
    if (fast === null) {
        return head.next
    }

    // Move both pointers
    while (fast.next !== null) {
        fast = fast.next
        slow = slow.next
    }

    // Remove nth node
    slow.next = slow.next.next

    return head
}
```

---

## Dry Run

![Remove Nth Node From End Dry Run](/img/dsa/remove-nth-node-from-end-dry-run.svg)

**Example 1:** `head = [1, 2, 3, 4, 5]`, `n = 2`

**Step 1 — Move `fast` 2 steps ahead:**

| Step | `fast` |
|------|--------|
| 0 | 1 |
| 1 | 2 |
| 2 | 3 |

**Step 2 — Move both until `fast.next === null`:**

| Step | `slow` | `fast` |
|------|--------|--------|
| Start | 1 | 3 |
| 1 | 2 | 4 |
| 2 | 3 | 5 (`fast.next` is `null` → stop) |

**Step 3 — Remove:** `slow.next = slow.next.next` → skip node `4`

**Result:** `[1, 2, 3, 5]` ✅

---

## Test Cases

```js
console.log(removeNthFromEnd(toList([1,2,3,4,5]), 2)); // [1,2,3,5]
console.log(removeNthFromEnd(toList([1]), 1));           // null
console.log(removeNthFromEnd(toList([1,2]), 1));         // [1]
console.log(removeNthFromEnd(toList([1,2]), 2));         // [2]
console.log(removeNthFromEnd(toList([1,2,3]), 3));       // [2,3]
```
