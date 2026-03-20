---
sidebar_position: 10
title: Reverse Nodes in k-Group
---

# Reverse Nodes in k-Group

> **LeetCode 25** – [Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/)

## Problem Statement

Given the `head` of a linked list, reverse the nodes of the list `k` at a time, and return the modified list.

`k` is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of `k` then left-out nodes at the end should remain as-is.

You may not alter the values in the list's nodes, only nodes themselves may be changed.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `head = [1,2,3,4,5]`, `k = 2` | `[2,1,4,3,5]` |
| 2 | `head = [1,2,3,4,5]`, `k = 3` | `[3,2,1,4,5]` |

### Constraints

- `1 <= k <= n <= 5000`
- `0 <= Node.val <= 1000`

---

## Solution

**Approach:** Process the list in groups of `k`:
1. Find the `kᵗʰ` node from the current position.
2. If fewer than `k` nodes remain, attach them as-is and break.
3. Otherwise, detach the group, reverse it recursively, and reconnect.

Uses helper functions `findkthnode` (to locate the `kᵗʰ` node) and `reverse` (recursive reversal).

- **Time Complexity:** $O(n)$ — each node is visited a constant number of times.
- **Space Complexity:** $O(n/k)$ — recursion depth for each group reversal (could be $O(k)$ per group).

```js
/**
 * @param {ListNode} head
 * @param {number} k
 * @return {ListNode}
 */
var reverseKGroup = function(head, k) {
    let temp=head
    let nextnode
    let prevnode
    while(temp!=null)
    {
        let kthnode=findkthnode(temp,k)
        if(kthnode==null)
        {
            if(prevnode){
                prevnode.next=temp
            }
            break
        }
        nextnode=kthnode.next
        kthnode.next=null
        reverse(temp)
        if(temp===head)
        {
            head=kthnode
        }
        else{
            prevnode.next=kthnode
        }
        prevnode=temp
        temp=nextnode
    }   
    return head
};
function reverse(temp)
{
    if(temp==null || temp.next==null)
    {
        return temp
    }
    let newhead=reverse(temp.next)
    
    let front = temp.next
    front.next=temp
    temp.next=null
    return newhead
}
function findkthnode(temp,k)
{
    k-=1
    while(temp!=null && k>0)
    {
        k--
        temp=temp.next
    }
    return temp
}
```

---

## Dry Run

![Reverse Nodes In K Group Dry Run](/img/dsa/reverse-nodes-in-k-group-dry-run.svg)

**Example 1:** `head = [1, 2, 3, 4, 5]`, `k = 2`

### Iteration 1: `temp = 1`

- `findkthnode(1, 2)` → node `2` (kth node)
- `nextnode = 3`, detach: `1→2→null`
- `reverse(1)` → `2→1→null`
- First group, so `head = 2`
- `prevnode = 1`

```
2 → 1    3 → 4 → 5
```

### Iteration 2: `temp = 3`

- `findkthnode(3, 2)` → node `4` (kth node)
- `nextnode = 5`, detach: `3→4→null`
- `reverse(3)` → `4→3→null`
- `prevnode.next = 4` → connect `1→4`
- `prevnode = 3`

```
2 → 1 → 4 → 3    5
```

### Iteration 3: `temp = 5`

- `findkthnode(5, 2)` → `null` (fewer than `k` nodes)
- `prevnode.next = 5` → connect `3→5`
- Break

```
2 → 1 → 4 → 3 → 5
```

**Result:** `[2, 1, 4, 3, 5]` ✅

---

## Test Cases

```js
console.log(reverseKGroup(toList([1,2,3,4,5]), 2)); // [2,1,4,3,5]
console.log(reverseKGroup(toList([1,2,3,4,5]), 3)); // [3,2,1,4,5]
console.log(reverseKGroup(toList([1,2,3,4,5]), 1)); // [1,2,3,4,5]
console.log(reverseKGroup(toList([1]), 1));           // [1]
console.log(reverseKGroup(toList([1,2]), 2));         // [2,1]
```
