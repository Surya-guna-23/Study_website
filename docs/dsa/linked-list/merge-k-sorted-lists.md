---
sidebar_position: 9
title: Merge K Sorted Lists
---

# Merge K Sorted Lists

> **LeetCode 23** – [Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/)

## Problem Statement

You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.

### Examples

| # | Input | Output |
|---|-------|--------|
| 1 | `lists = [[1,4,5],[1,3,4],[2,6]]` | `[1,1,2,3,4,4,5,6]` |
| 2 | `lists = []` | `[]` |
| 3 | `lists = [[]]` | `[]` |

### Constraints

- `k == lists.length`
- `0 <= k <= 10⁴`
- `0 <= lists[i].length <= 500`
- `-10⁴ <= lists[i][j] <= 10⁴`
- Each `lists[i]` is sorted in ascending order.
- Total nodes across all lists ≤ `10⁴`.

---

## Solution

**Approach:** Use a **min-heap (Priority Queue)**. Push the head of each list into the heap. Repeatedly extract the minimum node, append it to the result, and push its `next` node (if any) back into the heap.

- **Time Complexity:** $O(N \log k)$ — where `N` is the total number of nodes and `k` is the number of lists. Each heap operation is $O(\log k)$.
- **Space Complexity:** $O(k)$ — the heap holds at most `k` nodes.

```js
var mergeKLists = function(lists) {
    let pq = new PriorityQueue((a, b) => a.val - b.val);

    for (let i = 0; i < lists.length; i++) {
        if (lists[i]) {
            pq.enqueue(lists[i]); // enqueue node directly
        }
    }

    let dummy = new ListNode(-1);
    let temp = dummy;

    while (!pq.isEmpty()) {
        const node = pq.dequeue(); // node itself

        if (node.next) {
            pq.enqueue(node.next);
        }

        temp.next = node;
        temp = temp.next;
    }

    return dummy.next;
};
```

---

## Dry Run

**Example 1:** `lists = [[1,4,5], [1,3,4], [2,6]]`

**Initial heap** (min at top): push heads `1`, `1`, `2`

| Step | Dequeue (min) | Heap (after enqueue next) | Result so far |
|------|--------------|--------------------------|---------------|
| 1 | **1** (list 0) | `[1, 2, 4]` (push `4`) | `1` |
| 2 | **1** (list 1) | `[2, 4, 3]` (push `3`) | `1→1` |
| 3 | **2** (list 2) | `[3, 4, 6]` (push `6`) | `1→1→2` |
| 4 | **3** (list 1) | `[4, 6, 4]` (push `4`) | `1→1→2→3` |
| 5 | **4** (list 0) | `[4, 6, 5]` (push `5`) | `1→1→2→3→4` |
| 6 | **4** (list 1) | `[5, 6]` (no next) | `1→1→2→3→4→4` |
| 7 | **5** (list 0) | `[6]` (no next) | `1→1→2→3→4→4→5` |
| 8 | **6** (list 2) | `[]` (no next) | `1→1→2→3→4→4→5→6` |

**Result:** `[1, 1, 2, 3, 4, 4, 5, 6]` ✅

---

## Test Cases

```js
console.log(mergeKLists([toList([1,4,5]), toList([1,3,4]), toList([2,6])]));
// [1,1,2,3,4,4,5,6]

console.log(mergeKLists([]));    // null
console.log(mergeKLists([[]]));  // null

console.log(mergeKLists([toList([1]), toList([0])]));
// [0,1]
```
