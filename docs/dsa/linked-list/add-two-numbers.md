---
sidebar_position: 6
title: Add Two Numbers
---

# Add Two Numbers

> **LeetCode 2** – [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/)

## Problem Statement

You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each node contains a single digit. Add the two numbers and return the sum as a linked list.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `l1 = [2,4,3]`, `l2 = [5,6,4]` | `[7,0,8]` (342 + 465 = 807) |
| 2 | `l1 = [0]`, `l2 = [0]` | `[0]` |
| 3 | `l1 = [9,9,9,9,9,9,9]`, `l2 = [9,9,9,9]` | `[8,9,9,9,0,0,0,1]` |

### Constraints

- `1 <= Number of nodes <= 100`
- `0 <= Node.val <= 9`
- Numbers do not contain leading zeros (except `0` itself).

---

## Solution

**Approach:** Traverse both lists simultaneously, adding corresponding digits along with the carry. Create a new node for each digit of the result. Handle carry after the loop ends.

- **Time Complexity:** $O(\max(n, m))$ — process the longer list fully.
- **Space Complexity:** $O(\max(n, m))$ — the result list.

```js
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function(l1, l2) {
    let dummynode = new ListNode(-1)
    let t1=l1;
    let t2=l2
    let sum,carry=0
    let curr = dummynode
    while(t1!=null||t2!=null)
    {
        sum=carry
        if(t1)sum+=t1.val
        if(t2)sum+=t2.val

        let node = new ListNode(sum%10)
        carry=Math.floor(sum/10)
        curr.next=node
        curr=curr.next

        if(t1) t1=t1.next
        if(t2) t2=t2.next
    }
    if(carry)
    {
        let node= new ListNode(carry)
        curr.next = node
    }
    return dummynode.next
};
```

---

## Dry Run

**Example 1:** `l1 = [2,4,3]`, `l2 = [5,6,4]` → represents `342 + 465 = 807`

| Step | `t1.val` | `t2.val` | `carry` (in) | `sum` | New digit (`sum%10`) | `carry` (out) |
|------|----------|----------|-------------|-------|---------------------|---------------|
| 1 | 2 | 5 | 0 | 7 | **7** | 0 |
| 2 | 4 | 6 | 0 | 10 | **0** | 1 |
| 3 | 3 | 4 | 1 | 8 | **8** | 0 |

No remaining carry → **Result:** `[7, 0, 8]` ✅

---

**Example 3:** `l1 = [9,9,9,9,9,9,9]`, `l2 = [9,9,9,9]`

| Step | `t1.val` | `t2.val` | `carry` (in) | `sum` | Digit | `carry` (out) |
|------|----------|----------|-------------|-------|-------|---------------|
| 1 | 9 | 9 | 0 | 18 | **8** | 1 |
| 2 | 9 | 9 | 1 | 19 | **9** | 1 |
| 3 | 9 | 9 | 1 | 19 | **9** | 1 |
| 4 | 9 | 9 | 1 | 19 | **9** | 1 |
| 5 | 9 | — | 1 | 10 | **0** | 1 |
| 6 | 9 | — | 1 | 10 | **0** | 1 |
| 7 | 9 | — | 1 | 10 | **0** | 1 |
| Post | — | — | 1 | — | **1** | — |

**Result:** `[8, 9, 9, 9, 0, 0, 0, 1]` ✅

---

## Test Cases

```js
console.log(addTwoNumbers(toList([2,4,3]), toList([5,6,4])));       // [7,0,8]
console.log(addTwoNumbers(toList([0]), toList([0])));                 // [0]
console.log(addTwoNumbers(toList([9,9,9,9,9,9,9]), toList([9,9,9,9]))); // [8,9,9,9,0,0,0,1]
console.log(addTwoNumbers(toList([5]), toList([5])));                 // [0,1]
```
