---
sidebar_position: 8
title: Copy List with Random Pointer
---

# Copy List with Random Pointer

> **LeetCode 138** – [Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer/) | **Striver (TUF)** – [Clone Linked List with Random Pointer Article](https://takeuforward.org/data-structure/clone-linked-list-with-random-and-next-pointer/)

## Problem Statement

A linked list of length `n` is given where each node has an additional **random** pointer, which could point to any node in the list, or `null`.

Construct a **deep copy** of the list. Return the head of the copied linked list.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `[[7,null],[13,0],[11,4],[10,2],[1,0]]` | `[[7,null],[13,0],[11,4],[10,2],[1,0]]` |
| 2 | `[[1,1],[2,1]]` | `[[1,1],[2,1]]` |
| 3 | `[[3,null],[3,0],[3,null]]` | `[[3,null],[3,0],[3,null]]` |

### Constraints

- `0 <= n <= 1000`
- `-10⁴ <= Node.val <= 10⁴`
- `random` is `null` or points to a node in the list.

---

## Solution

**Approach (In-place, O(1) space):** Three-pass technique:

1. **Create copy nodes** — insert a clone after each original node: `A → A' → B → B' → ...`
2. **Set random pointers** — `copy.random = original.random.next` (the clone of the random target)
3. **Extract the copy list** — separate original and cloned lists.

- **Time Complexity:** $O(n)$ — three passes through the list.
- **Space Complexity:** $O(1)$ — no extra data structures (output doesn't count).

```js
/**
 * @param {_Node} head
 * @return {_Node}
 */
var copyRandomList = function(head) {
    createnode(head)
    randompointer(head)
    return finalmap(head)
};
function createnode(head){
    let temp=head
    while(temp!=null)
    {
        let copy = new ListNode(temp.val)
        copy.next=temp.next
        temp.next=copy
        temp=temp.next.next
    }

}
function randompointer(head){
    let temp=head
    while(temp!=null)
    {
        let copy=temp.next
        if(temp.random)
        {copy.random=temp.random.next}
        else{
            copy.random=null
        }
        temp=temp.next.next
    }
}
function finalmap(head)
{
    const dummynode = new ListNode(-1)
    let res = dummynode
    let temp =head
    while(temp!=null)
    {
        res.next=temp.next
        temp.next=temp.next.next
        res=res.next
        temp=temp.next
    }
    return dummynode.next
}
```

---

## Dry Run

![Copy List With Random Pointer Dry Run](/img/dsa/copy-list-with-random-pointer-dry-run.svg)

**Example:** `[[7,null],[13,0],[11,4],[10,2],[1,0]]`

```
Original:  7 → 13 → 11 → 10 → 1
random:   null   7   1    11   7
```

### Pass 1 — `createnode`: Interleave copies

```
7 → 7' → 13 → 13' → 11 → 11' → 10 → 10' → 1 → 1'
```

### Pass 2 — `randompointer`: Set random on copies

| Original | `original.random` | `copy.random = original.random.next` |
|----------|-------------------|--------------------------------------|
| 7 | `null` | `null` |
| 13 | 7 | **7'** |
| 11 | 1 | **1'** |
| 10 | 11 | **11'** |
| 1 | 7 | **7'** |

### Pass 3 — `finalmap`: Separate lists

```
Original: 7 → 13 → 11 → 10 → 1
Copy:     7' → 13' → 11' → 10' → 1'  (with correct random pointers)
```

**Result:** Deep copy created ✅

---

## Test Cases

```js
// Build: [7,null] → [13,0] → [11,4] → [10,2] → [1,0]
let n1 = new _Node(7), n2 = new _Node(13), n3 = new _Node(11),
    n4 = new _Node(10), n5 = new _Node(1);
n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n5;
n1.random = null; n2.random = n1; n3.random = n5;
n4.random = n3; n5.random = n1;

let copy = copyRandomList(n1);
// Verify: copy is a deep copy with same structure
```
